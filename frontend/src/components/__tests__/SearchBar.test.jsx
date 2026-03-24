import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '../SearchBar';

describe('SearchBar component', () => {
    it('should render the input field', () => {
        render(<SearchBar />);
        expect(screen.getByPlaceholderText(/Search study materials/i)).toBeInTheDocument();
    });

    it('should call onSearch when typing', () => {
        const onSearch = vi.fn();
        render(<SearchBar onSearch={onSearch} />);
        
        const input = screen.getByPlaceholderText(/Search study materials/i);
        fireEvent.change(input, { target: { value: 'math' } });

        expect(onSearch).toHaveBeenCalledWith('math');
        expect(input.value).toBe('math');
    });

    it('should call onSearch when submitting form', () => {
        const onSearch = vi.fn();
        const { container } = render(<SearchBar onSearch={onSearch} />);
        
        const input = screen.getByPlaceholderText(/Search study materials/i);
        fireEvent.change(input, { target: { value: 'science' } });
        
        const form = container.querySelector('form');
        fireEvent.submit(form);

        expect(onSearch).toHaveBeenCalledWith('science');
    });
});
