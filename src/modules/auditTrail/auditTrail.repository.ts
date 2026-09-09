import AuditTrail from './auditTrail.model.js';

const list = async ({
  filter = {},
  limit = 10,
  skip = 0,
}: {
  filter?: Record<string, any>;
  limit?: number;
  skip?: number;
}) => {
  return AuditTrail.find(filter)
    .select('userName action payload createdAt ipAddress -_id')
    .sort('-createdAt')
    .limit(limit)
    .skip(skip)
    .exec();
};

const count = async ({ filter = {} }: { filter?: Record<string, any> }) => {
  return AuditTrail.countDocuments(filter).exec();
};

const create = async (data: {
  action: string;
  ip: string;
  user?: string;
  payload?: Record<string, any>;
}) => {
  return AuditTrail.create({
    userName: data.user,
    action: data.action,
    ipAddress: data.ip,
    payload: data.payload,
  });
};

export const auditTrailRepository = {
  list,
  count,
  create,
};
