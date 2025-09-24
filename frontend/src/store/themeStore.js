import {create} from 'zustand'
import {persist} from 'zustand/middleware'

export const useThemeStore = create(persist((set) => ({
    step:1,
    theme: 'light',
    setTheme: (theme) => set({theme}),
})
,{name:'theme-storage',
 getStorage:() => localStorage,
},
))