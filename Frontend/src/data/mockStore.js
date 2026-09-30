import {
  initialUsers,
  initialUserVerificationDocuments,
  initialPets,
  initialVaccinationRecords,
  initialAppointments,
  initialRescueCases,
  initialRescueProgressLogs,
  initialRescuePhotos,
  initialFosterRecords,
  initialAdoptionApplications,
  initialAdoptionApplicationDocuments,
  initialAdoptionRecords,
  initialConsultations,
  initialPrescriptions,
  initialPrescriptionItems,
  initialSuppliers,
  initialInventoryItems,
  initialClinicPackages,
  initialPackageBookings,
  initialCareServiceLogs,
  initialFeedback,
  initialNotifications,
  initialPetDocuments,
  initialApprovalHistory,
} from './initialData';

const STORAGE_PREFIX = 'petnexus_db_v3_';

const SEED_MAP = {
  users: initialUsers,
  userVerificationDocuments: initialUserVerificationDocuments,
  approvalHistory: initialApprovalHistory,
  pets: initialPets,
  petDocuments: initialPetDocuments,
  vaccinations: initialVaccinationRecords,
  appointments: initialAppointments,
  rescueCases: initialRescueCases,
  rescueProgressLogs: initialRescueProgressLogs,
  rescuePhotos: initialRescuePhotos,
  fosterRecords: initialFosterRecords,
  adoptionApplications: initialAdoptionApplications,
  adoptionApplicationDocuments: initialAdoptionApplicationDocuments,
  adoptionRecords: initialAdoptionRecords,
  consultations: initialConsultations,
  prescriptions: initialPrescriptions,
  prescriptionItems: initialPrescriptionItems,
  suppliers: initialSuppliers,
  inventoryItems: initialInventoryItems,
  clinicPackages: initialClinicPackages,
  packageBookings: initialPackageBookings,
  careServiceLogs: initialCareServiceLogs,
  feedback: initialFeedback,
  notifications: initialNotifications,
};

// Initialize tables in localStorage if not already present, and merge any new seed records
export const initializeMockStore = (forceReset = false) => {
  Object.keys(SEED_MAP).forEach((table) => {
    const key = STORAGE_PREFIX + table;
    const raw = localStorage.getItem(key);
    if (forceReset || !raw) {
      localStorage.setItem(key, JSON.stringify(SEED_MAP[table]));
      return;
    }

    // Merge missing seed items into existing localStorage table
    try {
      const existing = JSON.parse(raw);
      if (Array.isArray(existing) && Array.isArray(SEED_MAP[table])) {
        let updated = false;
        SEED_MAP[table].forEach((seedItem) => {
          const exists = existing.some((item) => {
            if (table === 'users') {
              return (
                (item.email && seedItem.email && item.email.toLowerCase() === seedItem.email.toLowerCase()) ||
                (item.userId && seedItem.userId && String(item.userId) === String(seedItem.userId))
              );
            }
            if (table === 'pets') {
              return item.petId && seedItem.petId && String(item.petId) === String(seedItem.petId);
            }
            if (item.id && seedItem.id) return String(item.id) === String(seedItem.id);
            return false;
          });

          if (!exists) {
            existing.push(seedItem);
            updated = true;
          }
        });

        if (updated) {
          localStorage.setItem(key, JSON.stringify(existing));
        }
      }
    } catch (e) {
      console.error(`Error merging seed for ${table}:`, e);
    }
  });
};

// Initialize immediately upon import
initializeMockStore(false);

export const mockStore = {
  getTable(tableName) {
    const key = STORAGE_PREFIX + tableName;
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (SEED_MAP[tableName]) {
        localStorage.setItem(key, JSON.stringify(SEED_MAP[tableName]));
        return [...SEED_MAP[tableName]];
      }
      return [];
    }
    try {
      const items = JSON.parse(raw);
      // Fast self-healing check for users and pets tables
      if (tableName === 'users' && Array.isArray(items)) {
        let changed = false;
        SEED_MAP.users.forEach((seedUser) => {
          const found = items.some(
            (u) =>
              (u.email && seedUser.email && u.email.toLowerCase() === seedUser.email.toLowerCase()) ||
              (u.userId && seedUser.userId && String(u.userId) === String(seedUser.userId))
          );
          if (!found) {
            items.push(seedUser);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(key, JSON.stringify(items));
        }
      }
      return items;
    } catch (e) {
      console.error(`Error parsing table ${tableName}:`, e);
      return [];
    }
  },

  setTable(tableName, items) {
    const key = STORAGE_PREFIX + tableName;
    localStorage.setItem(key, JSON.stringify(items));
    return items;
  },

  getItem(tableName, idField, id) {
    const items = this.getTable(tableName);
    return items.find((item) => String(item[idField]) === String(id)) || null;
  },

  insertItem(tableName, item) {
    const items = this.getTable(tableName);
    items.unshift(item);
    this.setTable(tableName, items);
    return item;
  },

  updateItem(tableName, idField, id, updates) {
    const items = this.getTable(tableName);
    const index = items.findIndex((item) => String(item[idField]) === String(id));
    if (index === -1) {
      throw new Error(`Item not found in ${tableName} with ${idField}=${id}`);
    }
    items[index] = { ...items[index], ...updates };
    this.setTable(tableName, items);
    return items[index];
  },

  deleteItem(tableName, idField, id) {
    let items = this.getTable(tableName);
    items = items.filter((item) => String(item[idField]) !== String(id));
    this.setTable(tableName, items);
    return true;
  },

  filterTable(tableName, predicate) {
    const items = this.getTable(tableName);
    return items.filter(predicate);
  },

  resetAll() {
    initializeMockStore(true);
  }
};
