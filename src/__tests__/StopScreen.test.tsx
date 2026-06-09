import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import StopScreen from '../StopScreen';
import { openDatabase } from '@/db/Database';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@/db/Database', () => ({
  openDatabase: jest.fn(),
}));

// Mock getArrivalDate to return a fixed date in the future for tests
jest.mock('@/gtfs/utils/time', () => ({
  getArrivalDate: jest.fn((time) => {
      const d = new Date();
      d.setHours(23, 59, 59); // future
      return d;
  }),
}));

describe('StopScreen', () => {
  it('loads and renders routes for a stop', async () => {
    jest.useFakeTimers();
    const mockExecute = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('feed_meta')) {
        return Promise.resolve({
          rows: [{ freshnessDate: '2023-01-01' }],
        });
      }
      return Promise.resolve({
        rows: [
          { route_id: 'R1', route_long_name: 'Route 1', arrival_time: '12:00:00' },
        ],
      });
    });

    (openDatabase as jest.Mock).mockResolvedValue({
      execute: mockExecute,
    });

    const routeProp = {
      params: {
        stopId: 'S1',
        stopName: 'Test Stop 1',
      },
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <NavigationContainer>
            <StopScreen navigation={{}} route={routeProp} />
        </NavigationContainer>
      );
      jest.runAllTimers();
    });

    const root = renderer!.root;
    // Check if the route name and arrival time are rendered
    const sections = root.findAllByProps({ isDarkMode: false }); // Section props
    const found = sections.some(s => s.props.title && s.props.title.includes('Route 1'));
    expect(found).toBe(true);
  });
});
