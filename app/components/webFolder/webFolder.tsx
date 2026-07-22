export default function WebFolder() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center py-20">
      <svg
        width="100%"
        height="500"
        viewBox="0 0 800 500"
        className="max-w-4xl"
        preserveAspectRatio="none"
      >
        <defs>
          <clipPath id="folderClip">
            <path
              d="
                M0 0
                H360
                Q380 0 400 40
                H540
                Q560 0 580 0
                H760
                Q800 0 800 40
                V460
                Q800 500 760 500
                H40
                Q0 500 0 460
                V40
                Q0 0 40 0
                Z
              "
            />
          </clipPath>
        </defs>

        <rect
          width="800"
          height="500"
          fill="white"
          clipPath="url(#folderClip)"
        />
      </svg>
    </div>
  );
}
