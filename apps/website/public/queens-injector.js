(function() {
  function replaceATLANTA() {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    let node;
    const nodesToReplace = [];
    while (node = walker.nextNode()) {
      if (node.textContent && node.textContent.includes('ATLANTA')) {
        nodesToReplace.push(node);
      }
    }
    nodesToReplace.forEach(n => {
      if (n.textContent) {
        n.textContent = n.textContent.replace(/ATLANTA/g, 'QUEENS');
      }
    });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', replaceATLANTA);
  } else {
    replaceATLANTA();
  }
  
  const observer = new MutationObserver(replaceATLANTA);
  observer.observe(document.body, { childList: true, subtree: true });
})();
