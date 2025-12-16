import { Route, Switch, Redirect } from 'wouter';
import { useAuth } from './hooks/use-auth';
import Login from './pages/auth/login';
import Register from './pages/auth/register';
import Tenants from './pages/tenants/index';
import Dashboard from './pages/dashboard/index';
import Datasets from './pages/datasets/index';
import Jobs from './pages/jobs/index';
import Members from './pages/members/index';
import ApiKeys from './pages/api-keys/index';

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

function App() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/tenants">
        {() => <ProtectedRoute component={Tenants} />}
      </Route>
      <Route path="/dashboard/:id">
        {(params) => <ProtectedRoute component={Dashboard} params={params} />}
      </Route>
      <Route path="/datasets/:id">
        {(params) => <ProtectedRoute component={Datasets} params={params} />}
      </Route>
      <Route path="/jobs/:id">
        {(params) => <ProtectedRoute component={Jobs} params={params} />}
      </Route>
      <Route path="/members/:id">
        {(params) => <ProtectedRoute component={Members} params={params} />}
      </Route>
      <Route path="/api-keys/:id">
        {(params) => <ProtectedRoute component={ApiKeys} params={params} />}
      </Route>
      <Route path="/">
        <Redirect to="/tenants" />
      </Route>
    </Switch>
  );
}

export default App;
