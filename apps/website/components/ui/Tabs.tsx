import * as React from "react"

interface TabsProps {
  children: React.ReactNode
  defaultValue?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContextType {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined)

const Tabs = ({ children, defaultValue = "" }: TabsProps) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue)
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div>{children}</div>
    </TabsContext.Provider>
  )
}

const TabsList = ({ children, className = "" }: TabsListProps) => (
  <div className={`inline-flex h-9 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ${className}`}>
    {children}
  </div>
)

const TabsTrigger = ({ value, children, className = "" }: TabsTriggerProps) => {
  const context = React.useContext(TabsContext)
  if (!context) return null
  const { activeTab, setActiveTab } = context
  const isActive = activeTab === value
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all ${
        isActive
          ? "bg-slate-950 text-slate-50 shadow-sm dark:bg-slate-50 dark:text-slate-950"
          : "text-slate-500 dark:text-slate-400"
      } ${className}`}
    >
      {children}
    </button>
  )
}

const TabsContent = ({ value, children, className = "" }: TabsContentProps) => {
  const context = React.useContext(TabsContext)
  if (!context) return null
  const { activeTab } = context
  if (activeTab !== value) return null
  return <div className={`mt-2 ${className}`}>{children}</div>
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
