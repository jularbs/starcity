'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import useSWR from 'swr';
import { fetcher } from '@/actions/swr';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';
import { obscureEmail } from '@/lib/utils';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import RemoveUserComponent from './RemoveUserComponent';
import UnblockUserComponent from './UnblockUserComponent';
import UpdateUserComponent from './UpdateUserComponent';
import { Edit, Trash } from 'lucide-react';

const UserListComponent = () => {
  const { data, isLoading } = useSWR(
    { url: 'v1/user', params: { status: true } },
    fetcher,
  );

  const userList = data?.data || [];

  const [updateOpen, setUpdateOpen] = useState<boolean>(false);
  const [removeOpen, setRemoveOpen] = useState<boolean>(false);
  const [unblockOpen, setUnblockOpen] = useState<boolean>(false);
  const [currentId, setCurrentId] = useState('');

  const showData = () => {
    if (isLoading)
      return new Array(10).fill(0).map((item, key) => {
        return (
          <TableRow key={key}>
            <TableCell>
              <Skeleton className="w-50 h-6" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-60 h-6" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-50 h-6" />
            </TableCell>
            <TableCell>
              <Skeleton className="w-50 h-6" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Skeleton className="w-30 h-6" />
                <Skeleton className="w-30 h-6" />
              </div>
            </TableCell>
          </TableRow>
        );
      });

    if (!isLoading && userList.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return userList.map((item: any, key: number) => {
        return (
          <TableRow key={key}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{obscureEmail(item.email)}</TableCell>
            <TableCell>
              <div className="grid">
                <div className="capitalize">
                  {item.department.split('-').join(' ')}
                </div>
              </div>
            </TableCell>
            <TableCell>
              {item.lastLogin && format(new Date(item.lastLogin), 'PPP p')}
            </TableCell>
            <TableCell>{format(new Date(item.createdAt), 'PPP p')}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                {item.mistakes > 3 && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setCurrentId(item._id);
                      setUnblockOpen(true);
                    }}
                  >
                    Unblock
                  </Button>
                )}
                <Button
                  size="icon"
                  onClick={() => {
                    setCurrentId(item._id);
                    setUpdateOpen(true);
                  }}
                >
                  <Edit />
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => {
                    setCurrentId(item._id);
                    setRemoveOpen(true);
                  }}
                >
                  <Trash />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        );
      });
    }
  };

  return (
    <>
      <UpdateUserComponent
        id={currentId}
        open={updateOpen}
        onOpenChange={setUpdateOpen}
      />
      <RemoveUserComponent
        id={currentId}
        open={removeOpen}
        onOpenChange={setRemoveOpen}
      />
      <UnblockUserComponent
        id={currentId}
        open={unblockOpen}
        onOpenChange={setUnblockOpen}
      />
      <Card className="p-0 gap-0!">
        <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
          <div className="text-xl font-bold whitespace-nowrap">
            Manage Users
          </div>
        </CardHeader>
        <CardContent className="p-0 grow">
          {isLoading || userList.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Designation</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Date Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{showData()}</TableBody>
            </Table>
          ) : (
            <div className="p-4 text-center">No Registered Users</div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default UserListComponent;
