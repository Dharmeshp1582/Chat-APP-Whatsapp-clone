import { create } from "zustand";
import { getSocket } from "../services/chat.service";
import axiosInstance from "../services/url.service";

const useStatusStore = create((set,get) => ({
//state
statuses:[],
loading:false,
error:null,

// active
setStatuses: (statuses) => set({ statuses }),
setLoading: (loading) => set({ loading }),
setError: (error) => set({ error }),

// initialize the socket listeners 
initializeSocket: () => {
  const socket = getSocket();

  if(!socket) return;

  //real time status events 
  socket.on("new_status", (newStatus) => {
    set((state) => ({
      statuses: state.statuses.some((s)=> s._id === newStatus._id) ? state.statuses : [newStatus, ...state.statuses]
    }))
  }),


  socket.on("status_deleted", (statusId) => {
    set((state) => ({
      statuses: state.statuses.filter((s)=> s._id !== statusId) 
    }))
  }),

   socket.on("status_viewed", (statusId,viewers) => {
    set((state) => ({
      statuses: state.statuses.map((status)=> status._id === statusId ? {...status,viewers} : status)
    }))
  })
},

  cleanupSocket: () => {
    const socket = getSocket();
    if(socket){
    socket.off("new_status");
    socket.off("status_deleted");
    socket.off("status_viewed");
  }},

  //fetch status
  fetchStatuses: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axiosInstance.get("/status");
      set({ statuses: data.data || [], loading: false });
    } catch (error) {
      console.log("Error Fetching status",error)
      set({ error: error.message });
    }
  },

  // create status 
  createStatus: async (statusData)=>{
    set({ loading: true, error: null });
    try {
      const formData = new FormData();

      if(statusData.file){
        formData.append("media",statusData.file);
      }

      if(statusData.content?.trim()){
        formData.append("content",statusData.content);
      }

      const {data} = await axiosInstance.post("/status",formData,{
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      // add to status in local state 
      if(data.data){
        set((state) => ({
          statuses: state.statuses.some((s)=> s._id === data.data._id) ? state.statuses : [data.data, ...state.statuses]
        }));
      }

      return data.data;
    } catch (error) {
      console.log("Error creating status",error)
      set({ error: error.message ,loading: false });
      throw error
    }
  },

  // view status 
  viewStatus: async (statusId)=>{
    try {
      set({loading: true, error: null});
      await axiosInstance.put(`/status/${statusId}/view`); 
      set((state) => ({
        statuses: state.statuses.map((status)=> status._id === statusId ? {...status} : status)
      }))
      set({loading: false});
    } catch (error) {
      set({ error: error.message,loading: false });
      console.log("Error viewing status",error)
      throw error
    }
  },

  deleteStatus: async (statusId)=>{
    set({ loading: true, error: null });
    try {
       await axiosInstance.delete(`/status/${statusId}`); 
       set((state) => ({
         statuses: state.statuses.filter((s)=> s._id !== statusId)
       }))
      set({loading: false});

    } catch (error) {
      set({ error: error.message,loading: false });
      console.log("Error deleting status",error)
      throw error
    }
  },

  getStatusViewers: async (statusId)=>{
    set({ loading: true, error: null });
    try {
      const {data} = await axiosInstance.get(`/status/${statusId}/viewers`); 
      set({loading: false});
      return data.data;

    } catch (error) {
      set({ error: error.message });
      console.log("Error getting status viewers",error)
      throw error
    }
  },

  // helper function for groups 
  getGroupedStatuses: () => {
  const { statuses } = get();

  return statuses.reduce((acc, status) => {
    const statusUserId = status.user?._id;

    if (!statusUserId) return acc; // safety check

    if (!acc[statusUserId]) {
      acc[statusUserId] = {
        id: statusUserId,
        name: status.user?.username || "Unknown User",
        avatar: status.user?.profilePicture || "/default-avatar.png",
        statuses: [],
      };
    }

    acc[statusUserId].statuses.push({
      _id: status._id,
      media: status.content,
      contentType: status.contentType,
      timestamp: status.createdAt,
      viewers: status.viewers || [],
    });

    return acc;
  }, {});
},


  getUserStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatuses();
    return userId ? groupedStatus[userId] : null
  },


  getOtherStatuses: (userId) => {
    const groupedStatus = get().getGroupedStatuses();
    return Object.values(groupedStatus).filter((contact) => contact.id !== userId)
  },

  // clear error 
  clearError : () => set({error: null}),

  reset: () => set({
    statuses: [],
    loading: false,
    error: null
  }),


}))



export default useStatusStore;