import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import RouteScreen from '../RouteScreen';
import { openDatabase } from '@/db/Database';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@/db/Database', () => ({
  openDatabase: jest.fn(),
}));

describe('RouteScreen', () => {
  it('loads and renders stops for a route', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      rows: [
        { stop_id: 'S1', stop_name: 'Test Stop 1' },
      ],
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
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ title: 'Test Stop 1' }).length).toBeGreaterThanOrEqual(1);
  });
});
