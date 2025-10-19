import { Helmet } from 'react-helmet-async';

interface StructuredDataProps {
  data: object | object[];
}

export const StructuredData = ({ data }: StructuredDataProps) => {
  const jsonLd = Array.isArray(data) ? data : [data];

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </script>
    </Helmet>
  );
};
