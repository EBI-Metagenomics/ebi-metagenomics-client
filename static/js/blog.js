(function(document, $) {
    var dummyElement = document.createElement('p');
    var blogURL = 'https://ebi-metagenomics.github.io/blog/';

    var processPost = function(data, source) {
        var dest = $(source).clone();
        // process title
        $(dest).find('h3').text(data.title);
        // process content
        dummyElement.innerHTML = data.excerpt;
        $(dest).find('.home_box > div').html(dummyElement.textContent);

        // var header = dest.querySelector('div.home_box h2');
        // replaceWith(header);

        // process links
        var links = $(dest).find('.home_box > a');
        // Read more
        $(links[0]).attr('href', data.url);
        if (data.emg) {
            links[1] = $(links[1]).attr('href', data.emg.url);
            links[1] = $(links[1]).text(data.emg.text);
        } else {
            links[1] = $(links[1]).parent().remove(links[1]);
        }
        $(dest).find('h2').remove();
        $(source).replaceWith(dest);
        // source.parentElement.replaceChild(dest, source);
    };

    // You didn't see anything...
    var hideContainers = function() {
        var blogSection = document.getElementById('blog');
        blogSection.parentElement.removeChild(blogSection);
    };

    var handleData = function(data) {
        try {
            processPost(data.spotlight, document.getElementById('blog-spotlight'));
            processPost(data.tools, document.getElementById('blog-tools'));
        } catch (err) {
            console.error(err);
            handleError({statusText: err});
        }
    };

    var handleError = function(jqXHR) {
        hideContainers();
    };

    var main = function() {
        $.get(blogURL + 'feed-first-of-each.json').done(handleData).fail(handleError);
    };

    if (document.readyState !== 'loading') {
        main();
        return;
    }

    document.addEventListener('DOMContentLoaded', main, {once: true});
})(document, jQuery);