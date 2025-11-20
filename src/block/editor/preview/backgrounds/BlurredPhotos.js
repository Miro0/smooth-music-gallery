const BlurredPhotos = ({photo, blur = 10, zoom = 1.2, opacity = 0.5}) => {
  if (photo) {
    return (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 40,
          overflow: 'hidden',
          opacity,
        }}
      >
        <img
          alt={photo?.alt ?? 'Blurred photo'}
          src={photo.url}
          loading="lazy"
          decoding="async"
          style={{
            objectFit: 'cover',
            width: '100%',
            height: '100%',
            filter: `blur(${blur}px)`,
            transform: `scale(${zoom})`,
          }}
        />
      </div>
    );
  }

  return null;
};

export default BlurredPhotos;
