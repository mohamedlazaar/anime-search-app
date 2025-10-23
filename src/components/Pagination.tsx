
export default function Pagination({
  page,
  onPageChange,
  hasMore
}: {
  page: number;
  onPageChange: (p: number) => void;
  hasMore: boolean;
}) {
  return (
    <>
    {page <= 1 && !hasMore ? <></>: 
    <div style={{ margin: "1rem 0", display: "flex", alignItems:'center', justifyContent: 'center', gap: 8, color:'white' }}>
      <button onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1} className="pag_btn">
        ← Prev
      </button>
      <div>Page {page}</div>
      <button onClick={() => onPageChange(page + 1)} disabled={!hasMore} className="pag_btn">
        Next →
      </button>
    </div>        
    }
</>
  );
}
