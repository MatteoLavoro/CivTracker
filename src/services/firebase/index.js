// Firebase Main Export File
// This file exports all Firebase services for easy importing

// Firebase App
export { app, firebaseConfig } from "./config";

// Authentication
export {
  auth,
  signUp,
  signIn,
  signInWithGoogle,
  logOut,
  resetPassword,
  onAuthChange,
  getCurrentUser,
  updateUserProfile,
} from "./auth";

// Firestore Database
export {
  db,
  createDocument,
  setDocument,
  getDocument,
  getCollection,
  updateDocument,
  deleteDocument,
  queryDocuments,
  subscribeToDocument,
  subscribeToCollection,
} from "./firestore";

// Storage
export {
  storage,
  uploadFile,
  uploadFileWithProgress,
  getFileURL,
  deleteFile,
  listFiles,
} from "./storage";

// Campaigns
export {
  createCampaign,
  getCampaignByCode,
  joinCampaign,
  leaveCampaign,
  updateCampaignName,
  toggleCampaignImportant,
  getUserCampaigns,
  voteForCampaignStatus,
  revokeStatusVote,
} from "./campaigns";

// Member Details
export { updateMemberDetailsInCampaigns } from "./updateMemberDetails";

// Migrations
export { migrateMatchParticipantsPhotoURL } from "./migrateMatchParticipants";

// Leaders
export {
  getAllLeaders,
  getLeaderById,
  getLeadersByCivilization,
  updateLeaderDescription,
  updateLeaderAbilities,
  updateLeaderAgenda,
  searchLeaders,
} from "./leaders";

// Draft System
export {
  initializeDraft,
  togglePlayerReady,
  executeDraft,
  markPlayerSeenDraft,
  submitBanVote,
  finalizeBans,
  voteResetDraft,
  resetDraft,
  selectFinalLeader,
} from "./draft";

// Matches
export {
  createMatch,
  updateMatchTurns,
  updateParticipantScore,
  completeMatch,
  linkDraftToMatch,
} from "./matches";

// Database Seeding (dev only)
export { seedLeaders, verifyLeaderIcons } from "./seedLeaders";
