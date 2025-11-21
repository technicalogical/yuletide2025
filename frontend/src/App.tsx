import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              <Link to="/" className="text-2xl font-bold text-primary">
                🎄 Christmas Tracker
              </Link>
              <div className="flex gap-4">
                <Link to="/recipients">
                  <Button variant="ghost">Recipients</Button>
                </Link>
                <Link to="/gifts">
                  <Button variant="ghost">Gifts</Button>
                </Link>
                <Link to="/budget">
                  <Button variant="ghost">Budget</Button>
                </Link>
                <Link to="/purchases">
                  <Button variant="ghost">Purchases</Button>
                </Link>
              </div>
            </nav>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/recipients" element={<div>Recipients Page</div>} />
            <Route path="/gifts" element={<div>Gifts Page</div>} />
            <Route path="/budget" element={<div>Budget Page</div>} />
            <Route path="/purchases" element={<div>Purchases Page</div>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Welcome to Christmas Tracker! 🎅
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Organize your holiday shopping with smart budgeting and price tracking
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Recipients</h3>
          <p className="text-muted-foreground mb-4">Manage who you're shopping for</p>
          <Link to="/recipients">
            <Button className="w-full">View Recipients</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Gift Ideas</h3>
          <p className="text-muted-foreground mb-4">Track gift ideas and progress</p>
          <Link to="/gifts">
            <Button className="w-full">View Gifts</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Budget</h3>
          <p className="text-muted-foreground mb-4">Monitor spending and allocations</p>
          <Link to="/budget">
            <Button className="w-full">View Budget</Button>
          </Link>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Purchases</h3>
          <p className="text-muted-foreground mb-4">Track completed purchases</p>
          <Link to="/purchases">
            <Button className="w-full">View Purchases</Button>
          </Link>
        </div>
      </div>

      <div className="bg-card p-6 rounded-lg border shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Recipients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">0</div>
            <div className="text-sm text-muted-foreground">Gift Ideas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">$0</div>
            <div className="text-sm text-muted-foreground">Total Spent</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
