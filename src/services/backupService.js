// Backup and recovery service for data protection
import { buildStorageKey } from '../config/environment';

class BackupService {
  constructor() {
    this.backupKey = buildStorageKey('backups');
    this.maxBackups = 5;
    this.autoBackupInterval = null;
  }

  // Create a complete backup of all data
  async createBackup(description = 'Manual backup') {
    try {
      const backup = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        description,
        version: '1.0.0',
        data: await this.collectAllData()
      };

      // Compress data if possible
      const compressedBackup = await this.compressData(backup);
      
      // Store backup
      await this.storeBackup(compressedBackup);
      
      // Clean old backups
      await this.cleanOldBackups();

      return {
        success: true,
        backupId: backup.id,
        size: JSON.stringify(compressedBackup).length
      };
    } catch (error) {
      console.error('Backup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Collect all application data
  async collectAllData() {
    const data = {
      clients: [],
      properties: [],
      feedback: [],
      settings: {},
      customData: {}
    };

    // Collect from localStorage
    const keys = Object.keys(localStorage);
    const appKeys = keys.filter(key => key.startsWith(buildStorageKey('')));

    for (const key of appKeys) {
      const cleanKey = key.replace(buildStorageKey(''), '');
      try {
        const value = localStorage.getItem(key);
        const parsed = JSON.parse(value);
        
        if (cleanKey === 'clients') data.clients = parsed;
        else if (cleanKey === 'properties') data.properties = parsed;
        else if (cleanKey === 'feedback') data.feedback = parsed;
        else if (cleanKey === 'settings') data.settings = parsed;
        else data.customData[cleanKey] = parsed;
      } catch (e) {
        // Store raw value if not JSON
        data.customData[cleanKey] = localStorage.getItem(key);
      }
    }

    // Add metadata
    data.metadata = {
      totalClients: data.clients.length,
      totalProperties: data.properties.length,
      totalFeedback: data.feedback.length,
      dataSize: JSON.stringify(data).length
    };

    return data;
  }

  // Compress data using simple compression
  async compressData(data) {
    // In a real app, you might use a library like pako for gzip compression
    // For now, we'll just remove unnecessary whitespace
    const jsonString = JSON.stringify(data);
    
    // Simple compression: remove extra spaces and repeated patterns
    const compressed = jsonString
      .replace(/\s+/g, ' ')
      .replace(/,\s*/g, ',')
      .replace(/:\s*/g, ':');

    return {
      ...data,
      compressed: true,
      originalSize: jsonString.length,
      compressedSize: compressed.length,
      compressionRatio: ((1 - compressed.length / jsonString.length) * 100).toFixed(2) + '%'
    };
  }

  // Store backup
  async storeBackup(backup) {
    // Get existing backups
    const backups = await this.getBackups();
    
    // Add new backup
    backups.push({
      id: backup.id,
      timestamp: backup.timestamp,
      description: backup.description,
      size: backup.compressedSize || backup.originalSize,
      data: backup
    });

    // Store in localStorage
    localStorage.setItem(this.backupKey, JSON.stringify(backups));

    // Optional: Store in IndexedDB for larger data
    await this.storeInIndexedDB(backup);
  }

  // Store in IndexedDB for better performance with large data
  async storeInIndexedDB(backup) {
    if (!('indexedDB' in window)) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('RealtorAIBackups', 1);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        
        store.put(backup);
        
        transaction.oncomplete = () => {
          db.close();
          resolve();
        };
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'id' });
        }
      };
    });
  }

  // Get all backups
  async getBackups() {
    try {
      const stored = localStorage.getItem(this.backupKey);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Clean old backups
  async cleanOldBackups() {
    const backups = await this.getBackups();
    
    if (backups.length > this.maxBackups) {
      // Sort by timestamp (newest first)
      backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Keep only the latest backups
      const toKeep = backups.slice(0, this.maxBackups);
      
      localStorage.setItem(this.backupKey, JSON.stringify(toKeep));
    }
  }

  // Restore from backup
  async restoreBackup(backupId) {
    try {
      const backups = await this.getBackups();
      const backup = backups.find(b => b.id === backupId);
      
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Create a restore point before restoring
      await this.createBackup('Pre-restore backup');

      const data = backup.data.data || backup.data;
      
      // Restore each data type
      if (data.clients) {
        localStorage.setItem(buildStorageKey('clients'), JSON.stringify(data.clients));
      }
      if (data.properties) {
        localStorage.setItem(buildStorageKey('properties'), JSON.stringify(data.properties));
      }
      if (data.feedback) {
        localStorage.setItem(buildStorageKey('feedback'), JSON.stringify(data.feedback));
      }
      if (data.settings) {
        localStorage.setItem(buildStorageKey('settings'), JSON.stringify(data.settings));
      }
      
      // Restore custom data
      if (data.customData) {
        Object.entries(data.customData).forEach(([key, value]) => {
          localStorage.setItem(buildStorageKey(key), 
            typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      return {
        success: true,
        restoredItems: {
          clients: data.clients?.length || 0,
          properties: data.properties?.length || 0,
          feedback: data.feedback?.length || 0
        }
      };
    } catch (error) {
      console.error('Restore failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Export backup to file
  async exportBackup(backupId) {
    const backups = await this.getBackups();
    const backup = backups.find(b => b.id === backupId);
    
    if (!backup) {
      throw new Error('Backup not found');
    }

    const dataStr = JSON.stringify(backup.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `realtorai-backup-${backup.id}.json`;
    link.click();
    
    URL.revokeObjectURL(link.href);
  }

  // Import backup from file
  async importBackup(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          // Validate backup structure
          if (!data.id || !data.timestamp || !data.data) {
            throw new Error('Invalid backup file format');
          }
          
          // Store the backup
          await this.storeBackup(data);
          
          resolve({
            success: true,
            backupId: data.id
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // Start automatic backups
  startAutoBackup(intervalMinutes = 60) {
    this.stopAutoBackup();
    
    // Initial backup
    this.createBackup('Automatic backup');
    
    // Set interval
    this.autoBackupInterval = setInterval(() => {
      this.createBackup('Automatic backup');
    }, intervalMinutes * 60 * 1000);
  }

  // Stop automatic backups
  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  // Get backup statistics
  async getBackupStats() {
    const backups = await this.getBackups();
    
    if (backups.length === 0) {
      return {
        totalBackups: 0,
        oldestBackup: null,
        newestBackup: null,
        totalSize: 0
      };
    }

    const totalSize = backups.reduce((sum, backup) => sum + (backup.size || 0), 0);
    const sorted = backups.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      totalBackups: backups.length,
      oldestBackup: sorted[0],
      newestBackup: sorted[sorted.length - 1],
      totalSize,
      averageSize: Math.round(totalSize / backups.length)
    };
  }

  // Clear all backups
  async clearAllBackups() {
    const confirmed = window.confirm('Are you sure you want to delete all backups? This cannot be undone.');
    
    if (!confirmed) return false;
    
    localStorage.removeItem(this.backupKey);
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      await new Promise((resolve) => {
        const deleteReq = indexedDB.deleteDatabase('RealtorAIBackups');
        deleteReq.onsuccess = resolve;
        deleteReq.onerror = resolve;
      });
    }
    
    return true;
  }
}

// Create singleton instance
const backupService = new BackupService();

// Auto-start backups if enabled
if (typeof window !== 'undefined') {
  const autoBackupEnabled = localStorage.getItem(buildStorageKey('autoBackup')) === 'true';
  if (autoBackupEnabled) {
    backupService.startAutoBackup();
  }
}

export default backupService;