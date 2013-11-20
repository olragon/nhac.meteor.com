var root = this;

Songs = new Meteor.Collection();
Albums = new Meteor.Collection();

Meteor.startup(function () {
  // focus on textfield
  $('input[type="text"]').focus();

  // squaresend config
  root.sqs_title = 'Gợi ý chức năng, báo lỗi hay liên hệ';
  root.sqs_label_subject = 'Chủ đề';
  root.sqs_label_message = 'Nội dung';
  root.sqs_label_name = 'Tên của bạn';
  // root.sqs_label_email = '';
  root.sqs_label_submit = 'Gửi';
});

if (Meteor.isClient) {
  Template.hello.greeting = function () {
    return "Welcome to get.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });

  Template.get.events({
    'submit form': function (e) {
      e.preventDefault();
      var $form = $(e.target);
      var $button = $form.find('button[type="submit"]');
      var url = $form.find('input').val().trim();
      
      $button.attr('disabled', 'disabled')
      $button.find('span').text('Please wait ...');

      // remove old songs
      Songs.find().forEach(function (song) {
        Songs.remove(song._id);
      });
      Albums.find().forEach(function (album) {
        Albums.remove(album._id);
      });

      $.ajax({
        url: '/download/' + encodeURIComponent(url),
        success: function (data) {
          _.each(data.songs, function (song) {
            Songs.insert(song);
          });
          Albums.insert(data.album);
        },
        error: function (xhr, status) {
          alert(status);
          console.error(xhr);
        },
        complete: function () {
          $button.removeAttr('disabled')
          $button.find('span').text('Get');
        }
      });

      return;
    }
  });

  Template.songs.helpers({
    songs: function () {
      return Songs.find().fetch();
    }
  });

  Template.albums.helpers({
    album: function () {
      return Albums.findOne();
    }
  });
}

