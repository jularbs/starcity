'use client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from '@/components/ui/dialog';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import useSWR from 'swr';
import { fetcher } from '@/actions/swr';
import { Skeleton } from '@/components/ui/skeleton';
import { Key, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

const ActivityMonitorComponent = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(15);

  const { data, isLoading } = useSWR(
    { url: 'v1/audit-trail', params: { skip: skip, limit: limit } },
    fetcher,
  );

  const [payload, setPayload] = useState({});
  const [payloadOpen, setPayloadOpen] = useState(false);

  const showPagination = () => {
    return (
      <div className="flex items-center justify-between p-4">
        <div className="hidden text-xs font-semibold sm:block">
          Showing {skip + 1} -{' '}
          {currentPage * limit > data?.count
            ? data?.count
            : currentPage * limit}{' '}
          of {data?.count}
        </div>
        <Pagination className="mx-0! w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={() => {
                  if (currentPage > 1) {
                    setSkip(skip - limit);
                    setCurrentPage(currentPage - 1);
                  }
                }}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={() => {
                  if (currentPage < totalPages) {
                    setSkip(skip + limit);
                    setCurrentPage(currentPage + 1);
                  }
                }}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  //Change Date Side Effects
  useEffect(() => {
    if (data) {
      if (data.count) setTotalPages(Math.ceil(data.count / limit));
    }
  }, [data, limit]);

  useEffect(() => {
    if (!payloadOpen) setPayload({});
  }, [payloadOpen]);

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
            <TableCell className="">
              <div className="flex justify-end">
                <Skeleton className="w-20 h-6" />
              </div>
            </TableCell>
          </TableRow>
        );
      });

    if (!isLoading && data?.data)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return data?.data?.map((item: any, key: Key) => {
        return (
          <TableRow key={key}>
            <TableCell>{item.userName}</TableCell>
            <TableCell>{item.action}</TableCell>
            <TableCell>{format(item.createdAt, 'PPP p')}</TableCell>
            <TableCell>{item.ipAddress}</TableCell>
            <TableCell className="text-right">
              {item.payload && (
                <Button
                  type="button"
                  className="h-5 text-xs"
                  onClick={() => {
                    setPayloadOpen(true);
                    setPayload(item.payload);
                  }}
                >
                  Payload
                </Button>
              )}
            </TableCell>
          </TableRow>
        );
      });
  };

  const showPayload = () => {
    return (
      <Dialog open={payloadOpen} onOpenChange={setPayloadOpen}>
        <DialogContent className="max-h-screen overflow-y-auto">
          <DialogHeader className="gap-0">
            <DialogTitle className="flex items-center justify-between"></DialogTitle>
          </DialogHeader>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </DialogContent>
      </Dialog>
    );
  };
  return (
    <>
      <Card className="p-0 gap-0!">
        <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
          <div className="text-xl font-bold whitespace-nowrap">
            Activity Monitor
          </div>
        </CardHeader>
        <CardContent className="p-0 grow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Date Time</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="w-25">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>{showData()}</TableBody>
          </Table>
        </CardContent>
        {data && data.count > 0 && showPagination()}
      </Card>
      {showPayload()}
    </>
  );
};

export default ActivityMonitorComponent;
