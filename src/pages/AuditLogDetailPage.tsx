
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuditLogDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log Details</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Audit log ID: {id}</p>
        <p>Detailed audit log information would be displayed here.</p>
      </CardContent>
    </Card>
  );
};

export default AuditLogDetailPage;
