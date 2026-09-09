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

// Initialize tables in localStorage if not already present
export const initializeMockStore = (forceReset = false) => {
  Object.keys(SEED_MAP).forEach((table) => {
    const key = STORAGE_PREFIX + table;
    if (forceReset || !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(SEED_MAP[table]));
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
      return JSON.parse(raw);
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
