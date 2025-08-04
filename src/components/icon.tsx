interface IconProps extends React.HTMLAttributes<HTMLOrSVGElement> {}

export function LoaderIcon(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Loader</title>
      <g clipPath="url(#paint0_angular_781_22_clip_path)">
        <g transform="matrix(0 -0.01 0.01 0 12 12)">
          <foreignObject x="-1000" y="-1000" width="2000" height="2000">
            <div
              xmlns="http://www.w3.org/1999/xhtml"
              style={{
                background:
                  "conic-gradient(from 90deg,transparent 0deg,transparent 126deg,currentColor 342.626deg,currentColor 360deg)",
                height: "100%",
                width: "100%",
                opacity: 1,
              }}
            />
          </foreignObject>
        </g>
      </g>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z"
      />
      <circle cx="12" cy="4" r="2" fill="currentColor" />
      <defs>
        <clipPath id="paint0_angular_781_22_clip_path">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2ZM12 6C8.68629 6 6 8.68629 6 12C6 15.3137 8.68629 18 12 18C15.3137 18 18 15.3137 18 12C18 8.68629 15.3137 6 12 6Z"
          />
        </clipPath>
      </defs>
    </svg>
  );
}

export function ChatIconFill(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Chat</title>
      <path
        d="M12 19.8018C17.5228 19.8018 22 15.9962 22 11.3018C22 6.60734 17.5228 2.80176 12 2.80176C6.47715 2.80176 2 6.60734 2 11.3018C2 13.2933 2.80576 15.1248 4.15529 16.5737C4.60032 17.0515 4.82284 17.2904 4.91921 17.44C5.14431 17.7892 5.21115 17.9946 5.23483 18.4094C5.24497 18.587 5.21768 18.8126 5.16309 19.2636V19.2636C5.10398 19.7521 5.07442 19.9964 5.12674 20.1617C5.22984 20.4875 5.52851 20.7119 5.87015 20.7201C6.0435 20.7243 6.26986 20.6279 6.72256 20.435L8.07255 19.8598C8.43145 19.7069 8.6109 19.6305 8.77502 19.5913C8.9456 19.5505 9.04426 19.5384 9.21963 19.5367C9.38835 19.535 9.63966 19.5751 10.1423 19.6554C10.7442 19.7515 11.3652 19.8018 12 19.8018Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function ChatIconOutline(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Chat</title>
      <path
        d="M21.5 11.3018C21.5 15.6469 17.326 19.3018 12 19.3018C11.3916 19.3018 10.797 19.2536 10.2211 19.1616C10.1979 19.1579 10.1751 19.1543 10.1527 19.1507C9.71507 19.0807 9.42649 19.0346 9.21464 19.0367C9.00182 19.0388 8.86587 19.0555 8.65887 19.1049C8.45297 19.1541 8.23702 19.2462 7.92085 19.381C7.90631 19.3872 7.89155 19.3935 7.87657 19.3998L6.26188 20.0878C6.00192 20.1985 5.83863 20.2676 5.71646 20.3069C5.65912 20.3253 5.62729 20.3314 5.61346 20.3334C5.59608 20.3268 5.5809 20.3154 5.56964 20.3005C5.56775 20.2867 5.56471 20.2544 5.56645 20.1942C5.57016 20.0659 5.59096 19.8899 5.62491 19.6093L5.6329 19.5433C5.63617 19.5162 5.63941 19.4896 5.64259 19.4634C5.7094 18.9128 5.75468 18.5395 5.71219 18.2224C5.6922 18.0732 5.66936 17.9426 5.62742 17.8081C5.58549 17.6737 5.53006 17.5533 5.46171 17.4191C5.37626 17.2515 5.24062 17.0736 5.0759 16.8755C4.90743 16.6729 4.67976 16.4159 4.38708 16.0855L4.38081 16.0784C3.19317 14.7378 2.5 13.0841 2.5 11.3018C2.5 6.95659 6.67402 3.30176 12 3.30176C17.326 3.30176 21.5 6.95659 21.5 11.3018Z"
        strokeWidth="1"
        stroke="currentColor"
      />
    </svg>
  );
}

export function ContactIconFill(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Contact</title>
      <path
        d="M3.5 21C3.5 21 2 21 2 19.4C2 17.8 4 13 9.5 13C15 13 17 17.8 17 19.4C17 21 15.5 21 15.5 21H3.5Z"
        fill="#03C160"
      />
      <circle cx="9.5" cy="7.5" r="4.5" fill="currentColor" />
      <path
        d="M15.5 9H21.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M17 11.5781H21.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
      <path
        d="M18.5 14.1562H21.5"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ContactIconOutline(props: IconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Contact</title>
      <path
        d="M15.4922 20.25H3.50779C3.50499 20.2499 3.49981 20.2496 3.49252 20.249C3.47277 20.2475 3.43926 20.2441 3.3969 20.2366C3.30886 20.2209 3.20179 20.191 3.10294 20.1382C3.00797 20.0876 2.92862 20.0207 2.87037 19.9275C2.81365 19.8367 2.75 19.6783 2.75 19.4C2.75 18.8114 3.16303 17.3778 4.25946 16.0851C5.32307 14.8312 6.99753 13.75 9.5 13.75C12.0025 13.75 13.6769 14.8312 14.7405 16.0851C15.837 17.3778 16.25 18.8114 16.25 19.4C16.25 19.6783 16.1864 19.8367 16.1296 19.9275C16.0714 20.0207 15.992 20.0876 15.8971 20.1382C15.7982 20.191 15.6911 20.2209 15.6031 20.2366C15.5607 20.2441 15.5272 20.2475 15.5075 20.249C15.5002 20.2496 15.495 20.2499 15.4922 20.25Z"
        stroke="currentColor"
        strokeWidth="1"
      />
      <circle
        cx="9.5"
        cy="7.5"
        r="3.75"
        stroke="currentColor"
        strokeWidth="1"
      />
      <path
        d="M15.5 9H21.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M17 11.5781H21.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M18.5 14.1562H21.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function RedEnvelopeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Red Envelope</title>
      <rect
        x="4.79999"
        y="2.40039"
        width="14.4"
        height="19.2"
        rx="2.4"
        fill="url(#paint0_linear_470_1628)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.80002 8.3629V6.24039C4.80002 4.89626 4.80002 4.2242 5.0616 3.71081C5.2917 3.25922 5.65885 2.89207 6.11044 2.66197C6.62383 2.40039 7.29589 2.40039 8.64002 2.40039H15.36C16.7041 2.40039 17.3762 2.40039 17.8896 2.66197C18.3412 2.89207 18.7083 3.25922 18.9384 3.71081C19.2 4.2242 19.2 4.89626 19.2 6.24039V8.36285C17.441 9.85762 14.8673 10.8004 12 10.8004C9.13275 10.8004 6.55908 9.85764 4.80002 8.3629Z"
        fill="#FE7E7E"
      />
      <circle cx="12" cy="10.8004" r="2.4" fill="#FFDD76" />
      <defs>
        <linearGradient
          id="paint0_linear_470_1628"
          x1="12"
          y1="2.40039"
          x2="12"
          y2="21.6004"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF7676" />
          <stop offset="1" stopColor="#EC4545" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function TripleCircleIcon(props: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Triple Circle</title>
      <path
        d="M7.95511 4.20859C5.89666 4.23248 4.23248 5.89666 4.20859 7.95511C2.67137 7.69734 1.5 6.36046 1.5 4.75C1.5 2.95507 2.95507 1.5 4.75 1.5C6.36046 1.5 7.69734 2.67137 7.95511 4.20859Z"
        fill="currentColor"
      />
      <path
        d="M11.2051 7.45859C9.14666 7.48248 7.48248 9.14666 7.45859 11.2051C5.92137 10.9473 4.75 9.61046 4.75 8C4.75 6.20507 6.20507 4.75 8 4.75C9.61046 4.75 10.9473 5.92137 11.2051 7.45859Z"
        fill="currentColor"
      />
      <path
        d="M14.5 11.25C14.5 13.0449 13.0449 14.5 11.25 14.5C9.45507 14.5 8 13.0449 8 11.25C8 9.45507 9.45507 8 11.25 8C13.0449 8 14.5 9.45507 14.5 11.25Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LocationIcon(props: IconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>Location</title>
      <g filter="url(#filter0_d_664_303)">
        <path
          d="M13.0711 24.0711C9.16583 20.1658 9.16583 13.8342 13.0711 9.92893C16.9763 6.02369 23.308 6.02369 27.2132 9.92893C31.1184 13.8342 31.1184 20.1658 27.2132 24.0711L22.3178 28.9664C21.6078 29.6765 21.2528 30.0315 20.8513 30.1837C20.3944 30.357 19.8899 30.357 19.4329 30.1837C19.0315 30.0315 18.6765 29.6765 17.9664 28.9664L13.0711 24.0711Z"
          fill="#39A9FF"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_664_303"
          x="7.14209"
          y="7"
          width="26"
          height="30.3137"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feMorphology
            radius="1"
            operator="erode"
            in="SourceAlpha"
            result="effect1_dropShadow_664_303"
          />
          <feOffset dy="4" />
          <feGaussianBlur stdDeviation="2" />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 0.369824 0 0 0 0 0.726924 0 0 0 0 1 0 0 0 0.25 0"
          />
          <feBlend
            mode="normal"
            in2="BackgroundImageFix"
            result="effect1_dropShadow_664_303"
          />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_664_303"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}

export function CallIncoming(props: IconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>CallIncoming</title>
      <path
        d="M11.0006 9C8.84219 9 6.88054 10.7914 7.17522 13.1594C8.45202 23.4193 16.5813 31.5487 26.8413 32.8255C29.2093 33.1201 31.0006 31.1584 31.0006 29V27.2508C31.0006 25.4843 29.8419 23.9271 28.1501 23.4195L26.1093 22.8072C24.7819 22.4091 23.3433 22.7717 22.3634 23.7516C22.0081 24.1071 21.551 24.1293 21.2613 23.95C19.1466 22.6416 17.359 20.854 16.0506 18.7395C15.8712 18.4496 15.8936 17.9926 16.249 17.6372C17.2289 16.6574 17.5917 15.2187 17.1934 13.8914L16.5811 11.8506C16.0736 10.1587 14.5163 9 12.7499 9H11.0006Z"
        fill="currentColor"
      />
      <path
        d="M29.6667 17C29.6667 17.7364 29.0698 18.3333 28.3334 18.3333H23.0001C22.2637 18.3333 21.6667 17.7364 21.6667 17V11.6667C21.6667 10.9303 22.2637 10.3333 23.0001 10.3333C23.7365 10.3333 24.3334 10.9303 24.3334 11.6667V13.7811L28.7239 9.39052C29.2446 8.86983 30.0889 8.86983 30.6095 9.39052C31.1302 9.91123 31.1302 10.7554 30.6095 11.2761L26.219 15.6667H28.3334C29.0698 15.6667 29.6667 16.2636 29.6667 17Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function CallOutgoing(props: IconProps) {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <title>CallOutgoing</title>
      <path
        d="M11.0006 9C8.84219 9 6.88054 10.7914 7.17522 13.1594C8.45202 23.4193 16.5813 31.5487 26.8413 32.8255C29.2093 33.1201 31.0006 31.1584 31.0006 29V27.2508C31.0006 25.4843 29.8419 23.9271 28.1501 23.4195L26.1093 22.8072C24.7819 22.4091 23.3433 22.7717 22.3634 23.7516C22.0081 24.1071 21.551 24.1293 21.2613 23.95C19.1466 22.6416 17.359 20.854 16.0506 18.7395C15.8712 18.4496 15.8936 17.9926 16.249 17.6372C17.2289 16.6574 17.5917 15.2187 17.1934 13.8914L16.5811 11.8506C16.0736 10.1587 14.5163 9 12.7499 9H11.0006Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23 10.3333C23 9.59696 23.597 9 24.3334 9H29.6667C30.4031 9 31 9.59696 31 10.3333V15.6667C31 16.403 30.4031 17 29.6667 17C28.9303 17 28.3334 16.403 28.3334 15.6667V13.5523L23.9428 17.9428C23.4222 18.4635 22.5779 18.4635 22.0572 17.9428C21.5366 17.4221 21.5366 16.5779 22.0572 16.0572L26.4478 11.6667H24.3334C23.597 11.6667 23 11.0697 23 10.3333Z"
        fill="currentColor"
      />
    </svg>
  );
}
