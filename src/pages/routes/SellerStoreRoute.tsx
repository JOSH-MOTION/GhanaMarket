import { useParams, useNavigate } from 'react-router-dom';
import { SellerStorePage } from '../SellerStorePage';

export default function SellerStoreRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  if (!slug) return null;
  return (
    <SellerStorePage
      storeSlug={slug}
      onBack={() => navigate(-1)}
      onProductClick={(id) => navigate(`/product/${id}`)}
      onMessageSeller={() => navigate('/messages')}
    />
  );
}
