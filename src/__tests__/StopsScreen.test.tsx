import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import StopsScreen from '../StopsScreen';
import { openDatabase } from '@/db/Database';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@/db/Database', () => ({
  openDatabase: jest.fn(),
}));

describe('StopsScreen', () => {
  it('loads and renders stops', async () => {
    jest.useFakeTimers();
    const mockExecute = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('feed_meta')) {
        return Promise.resolve({
          rows: [{ freshnessDate: '2023-01-01' }],
        });
      }
      return Promise.resolve({
        rows: [
          { stop_id: 'S1', stop_name: 'Test Stop 1', stop_code: '101' },
          { stop_id: 'S2', stop_name: 'Test Stop 2', stop_code: '102' },
        ],
      });
    });

    (openDatabase as jest.Mock).mockResolvedValue({
      execute: mockExecute,
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <NavigationContainer>
            <StopsScreen navigation={{}} />
        </NavigationContainer>
      );
      jest.runAllTimers();
    });

    const root = renderer!.root;
    // Check if the stop names are rendered
    // Use findByProps with title and isDarkMode to be more specific if needed
    // or just filter them.
    const sections = root.findAllByProps({ title: 'Test Stop 1' });
    expect(sections.length).toBeGreaterThanOrEqual(1);
    expect(root.findAllByProps({ title: 'Test Stop 2' }).length).toBeGreaterThanOrEqual(1);
  });
});
