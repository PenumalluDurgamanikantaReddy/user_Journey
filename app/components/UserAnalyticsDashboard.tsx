import { useBigQueryData, useBigQuery } from '@/app/hooks/useBigQueryData';

/**
 * Example component showing how to fetch and display BigQuery data
 */
export function UserAnalyticsDashboard() {
  // Example 1: Fetch users from the API
  const {
    data: users,
    loading: usersLoading,
    error: usersError,
    refetch: refetchUsers,
  } = useBigQueryData('/api/data/users', { limit: 100 });

  // Example 2: Execute raw SQL query
  const { data: stats, loading: statsLoading, error: statsError } = useBigQuery(
    `
      SELECT 
        COUNT(*) as total_users,
        COUNT(DISTINCT country) as countries
      FROM \`${process.env.NEXT_PUBLIC_PROJECT_ID}.users.users_table\`
    `
  );

  if (usersLoading || statsLoading) {
    return <div className="p-4">Loading data from BigQuery...</div>;
  }

  if (usersError || statsError) {
    return (
      <div className="p-4 text-red-600">
        Error: {usersError || statsError}
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">User Analytics Dashboard</h1>

      {/* Statistics Section */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-gray-600 text-sm font-semibold">Total Users</h3>
          <p className="text-2xl font-bold mt-2">
            {stats?.[0]?.total_users || 0}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-gray-600 text-sm font-semibold">Countries</h3>
          <p className="text-2xl font-bold mt-2">
            {stats?.[0]?.countries || 0}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Users</h2>
          <button
            onClick={refetchUsers}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
                  Country
                </th>
              </tr>
            </thead>
            <tbody>
              {users && users.length > 0 ? (
                users.map((user: any, index: number) => (
                  <tr key={index} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-3 text-sm">{user.id}</td>
                    <td className="px-6 py-3 text-sm">{user.name}</td>
                    <td className="px-6 py-3 text-sm">{user.email}</td>
                    <td className="px-6 py-3 text-sm">{user.country}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-3 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 text-sm text-gray-600">
          Showing {users?.length || 0} users
        </div>
      </div>

      {/* Debug Info (remove in production) */}
      <div className="mt-6 p-4 bg-gray-50 rounded text-xs text-gray-600">
        <p>📊 Data fetched from BigQuery via Next.js API</p>
        <p>🔄 Query results are cached for performance</p>
      </div>
    </div>
  );
}
