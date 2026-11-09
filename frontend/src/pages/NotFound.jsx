import { Link } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import { Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="card">
      <EmptyState icon={Compass} title="Page not found" description="The page you opened does not exist." action={<Link to="/" className="btn-primary">Go to dashboard</Link>} />
    </div>
  );
}
