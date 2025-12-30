$(document).ready(function () {
  // nav Toggle function
  $('.nav_toggler').on('click', function () {
    $(this).toggleClass('show');
    $('.nav-menu').toggleClass('show')
  });

  // TOC Functionality
  $('[data-toc-element="wrapper"]').each(function () {
      const $wrapper = $(this);
      const $tocList = $wrapper.find('[data-toc-element="list"]');
      const $article = $wrapper.find('[data-toc-element="article"]');

      const linkClass =
        $tocList.attr("data-toc-link-class") || "toc-link";
      const activeClass =
        $tocList.attr("data-toc-active-class") || "active";
      const scrollTopOffset =
        Number($tocList.attr("data-toc-scroll-top-offset")) || 0;
      const scrollDuration =
        Number($tocList.attr("data-toc-scroll-duration")) || 400;

      /* --------------------------------
         Throttle helper
      -------------------------------- */
      const throttle = (fn, delay) => {
        let locked;
        return function (...args) {
          if (locked) return;
          fn.apply(this, args);
          locked = true;
          setTimeout(() => (locked = false), delay);
        };
      };

      /* --------------------------------
         Set active TOC link
      -------------------------------- */
      const setActiveLink = throttle((id) => {
        const $current = $tocList.find(`.${activeClass}`);
        const $target = $tocList.find(
          `button[data-href="#${id}"]`
        );

        if ($target.hasClass(activeClass)) return;

        $current.removeClass(activeClass);
        $target.addClass(activeClass);

        history.replaceState(null, null, `#${id}`);
      }, 100);

      /* --------------------------------
         Clear active state when article
         is not intersecting
      -------------------------------- */
      new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) {
              $tocList.find(`.${activeClass}`).removeClass(activeClass);
            }
          });
        },
        { threshold: 0 }
      ).observe($article[0]);

      /* --------------------------------
         Debounce helper
      -------------------------------- */
      const debounce = (fn, delay) => {
        let timer;
        return function (...args) {
          clearTimeout(timer);
          timer = setTimeout(() => fn.apply(this, args), delay);
        };
      };

      /* --------------------------------
         Observe headings
      -------------------------------- */
      const headingObserver = new IntersectionObserver(
        debounce((entries) => {
          entries.forEach((entry) => {
            const id = entry.target.getAttribute("id");
            const headings = $article.find("h3").toArray();
            const lastHeading = headings[headings.length - 1];

            if (entry.isIntersecting) {
              setActiveLink(id);
            } else if (
              !entry.isIntersecting &&
              entry.target === lastHeading
            ) {
              if (
                entry.target.getBoundingClientRect().top <
                window.innerHeight
              ) {
                setActiveLink(id);
              }
            }
          });
        }, 50),
        {
          rootMargin: "0px 0px -25% 0px",
          threshold: [0, 0.25, 0.5, 0.75, 1]
        }
      );

      /* --------------------------------
         Generate IDs & TOC buttons
      -------------------------------- */
      const idCountMap = {};

      $article.find("h3").each(function () {
        const text = $(this).text();

        let slug = text
          .replace(/\s+/g, "-")
          .replace(/[°&\/\\#,+()$~%.'":;*?<>{}]/g, "")
          .toLowerCase();

        if (idCountMap[text]) {
          idCountMap[text]++;
          slug += `-${idCountMap[text]}`;
        } else {
          idCountMap[text] = 1;
        }

        $(this).attr("id", slug);
        headingObserver.observe(this);

        const $button = $("<button>")
          .text(text)
          .attr({
            type: "button",
            class: linkClass,
            "data-href": `#${slug}`
          })
          .on("click", function (e) {
            e.preventDefault();

            const $target = $($(this).attr("data-href"));
            const top =
              $target.offset().top - scrollTopOffset;

            setActiveLink(slug);

            $("html, body").animate(
              { scrollTop: top },
              scrollDuration
            );
          });

        $tocList.append($button);
      });

      /* --------------------------------
         Handle initial hash load
      -------------------------------- */
      if (window.location.hash) {
        const $target = $(window.location.hash);

        if ($target.length) {
          setTimeout(() => {
            const top =
              $target.offset().top - scrollTopOffset;

            setActiveLink(window.location.hash.substring(1));

            $("html, body").animate(
              { scrollTop: top },
              scrollDuration
            );
          }, 300);
        }
      }
    });
});
