import SettingsSidebar from '../navigation/SettingsSidebar';

const SettingsLayout = ({ children, activeSection, onSectionChange }) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SettingsSidebar
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
};

export default SettingsLayout; 