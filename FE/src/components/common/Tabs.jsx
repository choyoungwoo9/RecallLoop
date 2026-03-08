import './Tabs.css'

function Tabs({ tabs, activeTab, onTabChange }) {
  return (
    <div className="tabs">
      <div className="tabs__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tabs__tab ${activeTab === tab.id ? 'tabs__tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            type="button"
          >
            {tab.icon && <span className="tabs__icon">{tab.icon}</span>}
            <span className="tabs__label">{tab.label}</span>
          </button>
        ))}
      </div>
      <div className="tabs__content">
        {tabs.find((tab) => tab.id === activeTab)?.content}
      </div>
    </div>
  )
}

export default Tabs
