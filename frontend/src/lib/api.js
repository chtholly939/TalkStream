import { axiosInstance } from "./axios";

export const signup = async (signupData) => {
  const response = await axiosInstance.post("/auth/signup", signupData);
  return response.data;
};

export const login = async (loginData) => {
  const response = await axiosInstance.post("/auth/login", loginData);
  return response.data;
};
export const logout = async () => {
  const response = await axiosInstance.post("/auth/logout");
  return response.data;
};

export const getAuthUser = async () => {
  try {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  } catch (error) {
    if (error.response?.status !== 401) {
      console.log("Error in getAuthUser:", error);
    }
    return null;
  }
};

export const completeOnboarding = async (userData) => {
  const response = await axiosInstance.post("/auth/onboarding", userData);
  return response.data;
};

export async function getUserFriends() {
  const response = await axiosInstance.get("/users/chats");
  return response.data;
}

export async function getRecommendedUsers() {
  const response = await axiosInstance.get("/users");
  return response.data;
}

export const getAllUsers = async () => {
  const res = await axiosInstance.get("/users/all");
  return res.data;
};

export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

export async function sendFriendRequest(userId) {
  const response = await axiosInstance.post(`/users/friend-request/${userId}`);
  return response.data;
}

export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

export async function acceptFriendRequest(requestId) {
  const response = await axiosInstance.put(`/users/friend-request/${requestId}/accept`);
  return response.data;
}

export async function removeFriend(userId) {
  const response = await axiosInstance.delete(`/users/friend/${userId}`);
  return response.data;
}

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

export async function deleteConversation(targetUserId) {
  const response = await axiosInstance.delete(`/chat/conversations/${targetUserId}`);
  return response.data;
}

export const sendOtp = async (data) => {
  const res = await axiosInstance.post("/auth/send-otp", data);
  return res.data;
};

export const verifyOtp = async (data) => {
  const res = await axiosInstance.post("/auth/verify-otp", data);
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await axiosInstance.put("/users/profile", data);
  return res.data;
};

export const getCallLogs = async () => {
  const res = await axiosInstance.get("/calls");

  return res.data;
};

export const createCallLog = async (callData) => {
  const res = await axiosInstance.post("/calls", callData);

  return res.data;
};

export const createGroup = async ({ name, memberIds, image }) => {
  const res = await axiosInstance.post("/groups/create", { name, memberIds, image });
  return res.data;
};

export const getMyGroups = async () => {
  const res = await axiosInstance.get("/groups");
  return res.data.groups;
};

export const addMemberToGroup = async ({ channelId, userId }) => {
  const res = await axiosInstance.post(`/groups/${channelId}/add-member`, { userId });
  return res.data;
};

export const leaveGroup = async (channelId) => {
  const res = await axiosInstance.delete(`/groups/${channelId}/leave`);
  return res.data;
};
