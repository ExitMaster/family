(() => {
  const style = document.createElement('style');
  style.textContent = `
    .event.tone-report .item {
      background: #f3f4f6;
      border-color: #d9dde2;
    }
    .event.tone-report .event-icon {
      background: #e5e7eb;
      color: #5f6872;
    }
    .event.tone-report:before {
      border-color: #9aa2ab;
    }
    .event.tone-report .badge {
      background: #e8eaed;
      color: #626a73;
    }
    .event.tone-visit .item {
      background: #fff3f6;
      border-color: #f3ced8;
    }
    .event.tone-visit .event-icon {
      background: #ffe0e8;
      color: #c95678;
    }
    .event.tone-visit:before {
      border-color: #df7896;
    }
    .event.tone-visit .badge {
      background: #ffe3ea;
      color: #b94f6f;
    }
  `;
  document.head.appendChild(style);

  function applyEventTones(root = document) {
    root.querySelectorAll?.('.event').forEach(event => {
      event.classList.remove('tone-report', 'tone-visit');
      const title = event.querySelector('h3')?.textContent?.trim() || '';
      if (title === '환자보고') event.classList.add('tone-report');
      if (title === '병문안') event.classList.add('tone-visit');
    });
  }

  applyEventTones();
  new MutationObserver(() => applyEventTones()).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
