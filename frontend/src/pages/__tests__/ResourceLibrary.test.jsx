import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ResourceLibrary from '../ResourceLibrary';
import { fetchMaterials } from '../../services/materialService';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../../services/materialService', () => ({
    fetchMaterials: vi.fn(),
}));

// Mocking components to isolate page logic
vi.mock('../../components/Header', () => ({
    default: () => <div data-testid="header">Header</div>,
}));

describe('ResourceLibrary page', () => {
    const mockMaterials = [
        { _id: '1', title: 'Math Material', description: 'Calculus', type: 'PDF', createdAt: new Date().toISOString() }
    ];

    it('should show loading state and then display materials', async () => {
        fetchMaterials.mockResolvedValueOnce(mockMaterials);
        
        render(
            <BrowserRouter>
                <ResourceLibrary />
            </BrowserRouter>
        );

        expect(screen.getByText(/Loading database resources/i)).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Math Material')).toBeInTheDocument();
        });
    });

    it('should show error state if fetching fails', async () => {
        fetchMaterials.mockRejectedValueOnce(new Error('Fetch error'));
        
        render(
            <BrowserRouter>
                <ResourceLibrary />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/Failed to fetch materials from the actual server/i)).toBeInTheDocument();
        });
    });

    it('should show empty state if no materials are found', async () => {
        fetchMaterials.mockResolvedValueOnce([]);
        
        render(
            <BrowserRouter>
                <ResourceLibrary />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText(/No materials found in the database/i)).toBeInTheDocument();
        });
    });

    it('should call fetchMaterials again when searching', async () => {
        fetchMaterials.mockResolvedValue(mockMaterials);
        
        render(
            <BrowserRouter>
                <ResourceLibrary />
            </BrowserRouter>
        );

        const input = screen.getByPlaceholderText(/Search study materials/i);
        fireEvent.change(input, { target: { value: 'history' } });

        await waitFor(() => {
            expect(fetchMaterials).toHaveBeenCalledWith('history');
        });
    });
});
