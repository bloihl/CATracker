import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import RoutesScreen from '../RoutesScreen';
import { openDatabase } from '@/db/Database';
import { NavigationContainer } from '@react-navigation/native';

jest.mock('@/db/Database', () => ({
  openDatabase: jest.fn(),
}));

describe('RoutesScreen', () => {
  it('loads and renders routes', async () => {
    const mockExecute = jest.fn().mockResolvedValue({
      rows: [
        { route_id: 'R1', route_short_name: 'Short 1', route_long_name: 'Long 1' },
      ],
    });

    (openDatabase as jest.Mock).mockResolvedValue({
      execute: mockExecute,
      close: jest.fn(),
    });

    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(async () => {
      renderer = ReactTestRenderer.create(
        <NavigationContainer>
            <RoutesScreen navigation={{}} />
        </NavigationContainer>
      );
    });

    const root = renderer!.root;
    expect(root.findAllByProps({ title: 'Long 1' }).length).toBeGreaterThanOrEqual(1);
  });
});
