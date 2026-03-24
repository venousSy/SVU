import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth hook', () => {
    it('should start with user as null', () => {
        const { result } = renderHook(() => useAuth());
        expect(result.current.user).toBeNull();
    });

    it('should set user on login', () => {
        const { result } = renderHook(() => useAuth());
        const mockUser = { name: 'Ali' };

        act(() => {
            result.current.login(mockUser);
        });

        expect(result.current.user).toEqual(mockUser);
    });

    it('should set user to null on logout', () => {
        const { result } = renderHook(() => useAuth());
        const mockUser = { name: 'Ali' };

        act(() => {
            result.current.login(mockUser);
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
    });
});
