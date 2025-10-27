import { HomePage } from '../HomePage';
import { useNavigate } from 'react-router-dom';

export default function HomeRoute() {
  const navigate = useNavigate();
  return <HomePage onProductClick={(id) => navigate(`/product/${id}`)} />;
}
