var Cheerio = Meteor.require('cheerio');

Downloader = function (url) {
  this.url = url;
  this.uri = URI(url);
};
Downloader.prototype.download = function () {
  var self = this;
  var hostname = self.uri.hostname();
  var songs = [];
  var album = {};

  switch (hostname) {
    case 'mp3.zing.vn':
      // radio
      if (_.contains(self.uri.segment(), 'radio')) {
        var html = Meteor.call('getHTML', self.uri.toString(), true).content;
        var matches = html.match(/xmlURL:'[^']+'/);
        if (matches.length > 0) {
          var xmlURL = matches[0].replace("xmlURL:'", '').replace("'", '');
          var xml = Meteor.call('getHTML', xmlURL, true).content;
          var $ = Cheerio.load(xml, {xmlMode: true});
          $('item').each(function () {
            var song = {
              id: $(this).find('id').text(),
              name: $(this).find('title').text(),
              performer: $(this).find('performer').text(),
              source: $(this).find('source').text(),
              image: $(this).find('thumbnail').text(),
            };
            songs.push(song);
          });
          // console.log(xmlURL);
        }
        // var $ = Cheerio.load(html);
        // console.log(html.match(/xmlURL:'[^']+'/)[0]);
      } else {
        // others things: mp3, video ...
        self.uri.hostname('m.mp3.zing.vn');
        // get xml link
        var html = Meteor.call('getHTML', self.uri.toString(), true).content;
        var $ = Cheerio.load(html);
        var xml = $('#mp3Player').attr('xml');

        // song get info
        if (xml) {
          var json = Meteor.call('getHTML', xml, true).content;
          var songsInfo = JSON.parse(json);
          _.each(songsInfo.data, function (songInfo) {
            var song = {
              name: songInfo.title,
              type: songInfo.type,
              performer: songInfo.performer,
              source: songInfo.source
            };
            songs.push(song);
          });
          album = {
            name: $('.content-items h1').text(),
            img: $('.content-items img').attr('src'),
            artist: $('.content-items h2').text(),
            listens: $('.content-items .info-des .icon-luot-nghe').text(),
            favorites: $('.content-items .info-des .icon-luot-thich').text(),
          };
        } else {
          // video
          songs.push({
            name: $('.content-items h1').text(),
            artist: $('.content-items h2').text(),
            source: $('video#videoPlayer source').attr('src'),
            listens: $('.content-items .info-des .icon-luot-nghe').text(),
            favorites: $('.content-items .info-des .icon-luot-thich').text(),
          });
        }
      }
      break;
    case 'nhacso.net':
      var html = Meteor.call('getHTML', self.url, true).content;


      var $ = Cheerio.load(html);
      var flashvars = $('object param[name="flashvars"]').attr('value');
      if (!flashvars) return {};

      // parse params
      var params = {};
      _.each(flashvars.split('&'), function (val) {
        var key = val.split(/=/)[0];
        var value = val.replace(key + '=', '');
        params[key] = value;
      });

      if (params.xmlPath) {
        var xml = Meteor.call('getHTML', params.xmlPath).content;
        var $ = Cheerio.load(xml, {xmlMode: true});
        album = {
          name: $('playlist > name').text(),
          img: $('playlist > img').text(),
        };

        // song
        $('song').each(function () {
          var song = {
            name: $(this).find('name').text(),
            source: $(this).find('mp3link').text(),
            id: $(this).find('id').text(),
            performer: $(this).find('artist').text()
          }

          if (song.mp3link && song.name) {
            song.codec = song.mp3link.match(/\.[^\/\.]+$/)[0];
            song.filename = LibLanguages.viFilter(song.name);
            song.filename = _.str.humanize(song.filename);
            song.downloadlink = '/download/' + song.filename + song.codec + '/' + encodeURIComponent(song.mp3link);
            if (song.codec.match(/(mp3|wav|aac)/)) {
              song.type = 'audio';
            }

          }

          songs.push(song);
        });

        // video
        $('track').each(function () {
          var song = {
            name: $(this).find('title').text(),
            source: $(this).find('url').text(),
            id: $(this).find('id').text(),
            performer: $(this).find('artist').text()
          }
          songs.push(song);
        });
      }

      break;
    case 'www.nhaccuatui.com':
    case 'nhaccuatui.com':
      var html = Meteor.call('getHTML', self.uri.toString(), true).content;
      // console.log(html);
      var $ = Cheerio.load(html);

      // nhaccuatui use JS to init flash player
      var script = $('#flashPlayer').toString();
      if (!script) {};

      var matches = script.match(/file=[^"]+/);
      if (matches.length > 0) {
        var xmlFile = matches[0].replace('file=', '');
        var xml = Meteor.call('getHTML', xmlFile).content;
        var $ = Cheerio.load(xml, {xmlMode: true});
        $('track').each(function () {
          var song = {
            name: $(this).find('title').first().text(),
            performer: $(this).find('creator').text(),
            source: $(this).find('location').text(),
            link: $(this).find('info').text(),
            image: $(this).find('image').text(),
          };
          songs.push(song);
        });
      }
      break;
    case 'www.youtube.com':
    case 'youtube.com':
      var searches = self.uri.search(true);
      var info = Meteor.call('getHTML', 'http://www.youtube.com/get_video_info?video_id=' + searches.v).content;
      var videoInfo = decodeURIComponent(info);
      var params = {};
      _.each(videoInfo.split('&'), function (param) {
        var key = param.split('=')[0];
        var value = param.replace(key + '=', '');
        params[key] = value;
      });
      console.log('[youtube dl] params ->', params);

      var title = params.title;
      if (title) {
        title = title.replace(/[+]{1}/g, ' ');
      }
      songs.push({
        name: title,
        performer: params.author,
        source: decodeURIComponent(params.url),
        //source: 'http://www.youtube.com/get_video?video_id='+ encodeURIComponent(params.video_id) +'&t='+ encodeURIComponent(params.token) +'&fmt=18&asv=2',
        link: self.uri.toString(),
        image: params.thumbnail_url,
      });

      break;
    case 'tintuc.clip.vn':
    case 'phim.clip.vn':
    case 'thethao.clip.vn':
    case 'giaitri.clip.vn':
    case 'congnghe.clip.vn':
    case 'dep.clip.vn':
    case 'doisong.clip.vn':
    case 'live.clip.vn':
    case 'www.clip.vn':
    case 'clip.vn':
      var html = Meteor.call('getHTML', self.url).content;
      var $ = Cheerio.load(html);
      var embedURL = $('#watch-region link[itemprop="embedURL"]').attr('content');
      var videoId = embedURL.match(/([^\/]+)(,f$)/)[1];

      var videoInfoUrl = 'http://nfo.clip.vn/movies/nfo/' + videoId;
      console.log('videoInfoUrl ->', videoInfoUrl);
      var postParams = {
        referrer: Meteor.call('base64Encode', self.url),
        onsite: 'clip'
      };
      var xml = Meteor.call('getHTML', videoInfoUrl, true, 'post', {params: postParams}).content;
      
      var $ = Cheerio.load(xml);
      console.log('ClipData', $('ClipData'));

      var title = $('CurrentClip').find('title').toString();
      if (title && title.match(/(CDATA\[)(.+)(]])/).length > 3) {
        title = title.match(/(CDATA\[)(.+)(]])/)[2];
      }
      var song = {
        name: title,
        performer: $('CurrentClip').find('author').attr('name'),
        source: $('CurrentClip').find('enclosure').first().attr('url'),
        link: self.url,
        image: $('CurrentClip').find('thumbnail').attr('url')
      };
      console.log('song ->', song);

      $('CurrentClip').find('enclosure').each(function (element) {
        var mySong = _.clone(song);
        var quality = '';

        switch($(this).attr('quality')) {
          case '1':
            quality = '360p';
            break;
          case '2':
            quality = '480p';
            break;
          case "3":
            quality = '720p HD';
            break;
        }
        mySong.source = $(this).attr('url');
        mySong.name = mySong.name + ' ' + quality;
        songs.push(mySong);
      });
      // console.log('songs ->', songs)
      // console.log($('#watch-region link[itemprop="embedURL"]').attr('content'));
      // var flashvars = $('object param[name="flashvars"]').attr('value');
      // console.log($('#fixed_player').html());
      // if (!flashvars) return {};

      // // parse params
      // var params = {};
      // _.each(flashvars.split('&'), function (val) {
      //   var key = val.split(/=/)[0];
      //   var value = val.replace(key + '=', '');
      //   params[key] = value;
      // });

      // console.log(params);
      break;
    default:
      break;
  }

  return {
    songs: songs,
    album: album
  };
};


Router.map(function () {
  this.route('download', {
    path: '/download/:url',
    where: 'server',

    action: function () {
      var self = this;
      var params = self.params;

      var downloader = new Downloader(decodeURIComponent(params.url));
      var result = downloader.download();

      var headers = {
        'Content-Type': 'application/json; charset=utf-8',
      };
      _.each(headers, function(val, key) {
        self.response.setHeader(key, val);
      });
      self.response.writeHead(200);
      self.response.write(JSON.stringify(result));
      self.response.end();
    }
  });
});

