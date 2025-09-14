import React from "react"
import "./Scaffold.css"

interface ScaffoldProps {
  children: React.ReactNode
}

export const Scaffold: React.FC<ScaffoldProps> = ({ children }) => {
  return <>{children}</>
}
