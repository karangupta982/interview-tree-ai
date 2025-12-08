export function Button({ children, className = "", ...props }) {
  return (
    <button
      className={`px-5 py-3 rounded-xl font-medium text-white bg-purple-600 hover:bg-purple-700 transition-all active:scale-95 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// export function Button({ children, className = "", ...props }) {
//   return (
//     <button
//       className={`px-5 py-3 rounded-xl font-medium text-white bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 transition-all active:scale-95 ${className}`}
//       {...props}
//     >
//       {children}
//     </button>
//   );
// }
