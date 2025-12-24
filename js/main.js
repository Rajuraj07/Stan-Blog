$(document).ready(function () {
  $('.nav_toggler').on('click', function () {
    $(this).toggleClass('show');
    $('.nav-menu').toggleClass('show')
  })
});
