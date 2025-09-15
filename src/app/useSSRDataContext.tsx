import React, { createContext, useContext } from "react"

interface SSRContextType {
  loaderData: any
}

const SSRContext = createContext<SSRContextType | null>(null)

export const WouterLoaderProvider: React.FC<{
  children: React.ReactNode
  loaderData: any
}> = ({ children, loaderData }) => {
  return <SSRContext.Provider value={{ loaderData }}>{children}</SSRContext.Provider>
}

export const useSSRData = () => {
  const context = useContext(SSRContext)

  // During hydration, check if loader data is available in window
  if (!context?.loaderData && typeof window !== "undefined") {
    const windowLoaderData = (window as any).__LOADER_DATA
    console.log("🔍 Using window.__LOADER_DATA:", windowLoaderData)
    if (windowLoaderData) {
      return windowLoaderData
    }
  }

  if (!context) {
    throw new Error("useWouterLoaderData must be used within a WouterLoaderProvider")
  }

  console.log("🔍 Using context loader data:", context.loaderData)
  return context.loaderData
}
