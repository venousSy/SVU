import { render, screen } from '@testing-library/react';
import MaterialCard from '../MaterialCard';

describe('MaterialCard component', () => {
    it('should render the title and description', () => {
        render(<MaterialCard title="Math 101" description="Basic calculus" />);
        expect(screen.getByText('Math 101')).toBeInTheDocument();
        expect(screen.getByText('Basic calculus')).toBeInTheDocument();
    });

    it('should render the correct icon for PDF', () => {
        render(<MaterialCard type="pdf" />);
        expect(screen.getByText('📄')).toBeInTheDocument();
    });

    it('should render the correct icon for video', () => {
        render(<MaterialCard type="video" />);
        expect(screen.getByText('🎥')).toBeInTheDocument();
    });

    it('should render Anonymous if author is missing', () => {
        render(<MaterialCard title="Test" />);
        expect(screen.getByText(/By Anonymous/i)).toBeInTheDocument();
    });

    it('should display a View button with href if fileUrl is provided', () => {
        render(<MaterialCard title="Test" fileUrl="http://test.com/file" />);
        const link = screen.getByRole('link', { name: /View/i });
        expect(link).toHaveAttribute('href', 'http://test.com/file');
    });

    it('should display a disabled button if fileUrl is missing', () => {
        render(<MaterialCard title="Test" />);
        const button = screen.getByRole('button', { name: /View/i });
        expect(button).toBeDisabled();
    });
});
