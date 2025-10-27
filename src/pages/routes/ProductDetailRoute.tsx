import { useNavigate, useParams } from 'react-router-dom';
import { ProductDetailPage } from '../ProductDetailPage';

export default function ProductDetailRoute() {
  const { id } = useParams();
  const navigate = useNavigate();
  if (!id) return null;
  return (
    <ProductDetailPage
      productId={id}
      onBack={() => navigate(-1)}
      onViewStore={(slug) => navigate(`/store/${slug}`)}
      onMessageSeller={() => navigate('/messages')}
    />
  );
}
