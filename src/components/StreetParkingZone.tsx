interface StreetParkingZoneProps {
  position: { top: string; left: string };
  orientation: 'horizontal' | 'vertical';
  viewMode: 'map' | 'satellite';
}

export function StreetParkingZone({ position, orientation, viewMode }: StreetParkingZoneProps) {
  return (
    <div
      className="absolute z-5"
      style={{
        top: position.top,
        left: position.left,
        width: orientation === 'horizontal' ? '150px' : '20px',
        height: orientation === 'horizontal' ? '20px' : '100px'
      }}
    >
      {/* Street parking overlay */}
      <div 
        className="w-full h-full relative"
        style={{
          backgroundColor: viewMode === 'map' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.25)',
          border: '2px dashed rgba(59, 130, 246, 0.4)',
          borderRadius: '4px'
        }}
      >
        {/* Parking space dividers */}
        <div className="absolute inset-0">
          {orientation === 'horizontal' ? (
            <>
              <div className="absolute left-1/3 top-0 bottom-0 w-0.5 bg-blue-300 opacity-40" />
              <div className="absolute left-2/3 top-0 bottom-0 w-0.5 bg-blue-300 opacity-40" />
            </>
          ) : (
            <>
              <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-blue-300 opacity-40" />
              <div className="absolute top-2/3 left-0 right-0 h-0.5 bg-blue-300 opacity-40" />
            </>
          )}
        </div>
      </div>
      
      {/* Label */}
      <div 
        className="absolute bg-white px-2 py-0.5 rounded shadow-sm text-xs text-blue-600 whitespace-nowrap"
        style={{
          [orientation === 'horizontal' ? 'top' : 'left']: '100%',
          [orientation === 'horizontal' ? 'left' : 'top']: '50%',
          transform: orientation === 'horizontal' ? 'translate(-50%, 4px)' : 'translate(4px, -50%)'
        }}
      >
        Street Parking
      </div>
    </div>
  );
}
