import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import RouteScreen from '../RouteScreen';
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

describe('RouteScreen', () => {
  it('loads and renders stops for a route with next arrival time', async () => {
    jest.useFakeTimers();
    const mockExecute = jest.fn().mockImplementation((sql: string) => {
      if (sql.includes('feed_meta')) {
        return Promise.resolve({
          rows: [{ freshnessDate: '2023-01-01' }],
        });
      }
      return Promise.resolve({
        rows: [
          { stop_id: 'S1', stop_name: 'Test Stop 1', arrival_time: '12:00:00' },
        ],
      });
    });

    (openDatabase as jest.Mock).mockResolvedValue({
      execute: mockExecute,
    });

    const routeProp = {
      params: {
        routeId: 'R1',
        routeName: 'Test Route 1',
      },
    };

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <NavigationContainer>
            <RouteScreen navigation={{}} route={routeProp} />
        </NavigationContainer>
      );
      jest.runOnlyPendingTimers();
    });

    const root = renderer!.root;
    // Check if the stop name and arrival time are rendered
    const sections = root.findAllByProps({ isDarkMode: false }); // Section props
    const stopSection = sections.find(s => s.props.title === 'Test Stop 1');
    expect(stopSection).toBeDefined();

    const arrivalText = root.findAllByType(require('react-native').Text).some(t =>
      t.props.children && t.props.children.toString().includes('Next Arrival:')
    );
    expect(arrivalText).toBe(true);
  });
});
