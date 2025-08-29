import React from "react";

export default function FooterBar() {
  return (
    <footer className="footer footer-center bg-neutral text-neutral-content p-6 mt-8">
      <aside>
        <p className="text-sm opacity-80">
          © {new Date().getFullYear()} COCO Eats · All rights reserved.
        </p>
      </aside>
    </footer>
  );
}
