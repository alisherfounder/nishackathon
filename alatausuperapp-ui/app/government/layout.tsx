import Sidebar from "../components/Sidebar";
import TopHeader from "../components/TopHeader";

export default function GovernmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopHeader />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
