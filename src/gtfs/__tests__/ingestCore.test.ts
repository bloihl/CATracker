import { ingestFromCsvFiles } from '../ingestCore';
import { Database } from '@/db/Database';
import Papa from 'papaparse';

jest.mock('papaparse');
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('ingestCore', () => {
  let mockDb: jest.Mocked<Database>;

  beforeEach(() => {
    mockDb = {
      execute: jest.fn(),
      executeBatch: jest.fn().mockResolvedValue([]),
      withTransaction: jest.fn(),
      close: jest.fn(),
    } as any;

    (Papa.parse as jest.Mock).mockImplementation((csv, options) => {
      if (options.complete) {
        // Return some dummy data based on what's being parsed
        let data: any[] = [];
        if (csv.includes('route_id')) {
          data = [{ route_id: 'R1', route_long_name: 'Route 1' }];
        } else if (csv.includes('stop_id')) {
          data = [{ stop_id: 'S1', stop_name: 'Stop 1' }];
        }
        options.complete({ data });
      }
    });
  });

  it('should ingest routes and stops from CSV files', async () => {
    const files = {
      'routes.txt': 'route_id,route_long_name\nR1,Route 1',
      'stops.txt': 'stop_id,stop_name\nS1,Stop 1',
    };

    await ingestFromCsvFiles(mockDb, 'test-feed', files);

    expect(mockDb.executeBatch).toHaveBeenCalled();
    // Check if routes were inserted
    const routeCall = mockDb.executeBatch.mock.calls.find(call =>
      call[0][0].sql.includes('INSERT INTO routes')
    );
    expect(routeCall).toBeDefined();
    expect(routeCall![0][0].params).toContain('R1');

    // Check if stops were inserted
    const stopCall = mockDb.executeBatch.mock.calls.find(call =>
      call[0][0].sql.includes('INSERT INTO stops')
    );
    expect(stopCall).toBeDefined();
    expect(stopCall![0][0].params).toContain('S1');
  });

  it('should skip missing optional files', async () => {
    const files = {
      'routes.txt': 'route_id,route_long_name\nR1,Route 1',
    };

    await ingestFromCsvFiles(mockDb, 'test-feed', files);

    const stopCall = mockDb.executeBatch.mock.calls.find(call =>
        call[0][0].sql.includes('INSERT INTO stops')
    );
    expect(stopCall).toBeUndefined();
  });
});
