import { useSelector } from 'react-redux';
import { getAuthUser, isAuthenticated } from '../../store/selectors/AuthSelectors';

export default function useAuth() {
  const user = useSelector(getAuthUser);
  const authenticated = useSelector(isAuthenticated);

  return {
    user,
    isAuthenticated: authenticated,
  };
}
