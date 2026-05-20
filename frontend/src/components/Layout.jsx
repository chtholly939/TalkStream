// Layout is now handled directly by the Sidebar component (wraps children like CampusChat).
// This file is kept as a passthrough for pages that don't use Sidebar.
const Layout = ({ children }) => <>{children}</>;
export default Layout;
