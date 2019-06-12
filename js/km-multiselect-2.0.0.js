/**
 * Plugin Name: KM Multiselect
 * Author: Kiran Mulmi
 *
 * */
(function ($) {
  $.fn.kmMultiLevelMultiselect = function (options) {

    var _mainWrapper = $(this);

    var _defaults = {
      subject: 'Select an option',
      multiple: true,
      search: true,
      height: 240,
      checkAll: true,
      selectedTexts: true,
      url: false
    };

    var _items = _mainWrapper.find('select');

    var optionValuePair = {};
    var optionValuePairChekbox = {};

    var _settings = $.extend({}, _defaults, options);

    var _globalData = {};

    var multiselect = {
      processData: function () {

        $.ajax({
          url: _settings.url,
          type: 'get',
          dataType: 'json',
          success: function (response) {
            _globalData = response.data;
            console.log(_globalData);
            var _depth = 1;
            _items.each(function () {
              var _wrapper = $(this);

              if (_depth == 1) {
                _globalData.forEach(function (row) {
                  _wrapper.append(new Option(row.value, row.key));
                });
              }
              else if (_depth == 2) {
                _globalData.forEach(function (row) {
                  row.child.forEach(function (rw) {
                    _wrapper.append(new Option(rw.value, rw.key));
                  });
                });
              }
              else if (_depth == 3) {
                _globalData.forEach(function (row) {
                  row.child.forEach(function (rw) {
                    rw.child.forEach(function (r) {
                      _wrapper.append(new Option(r.value, r.key));
                    });
                  });
                });
              }

              multiselect.init(_wrapper, _depth);
              _depth++;

            });
          }
        });
      },
      init: function (_wrapper, $depth) {
        if (_settings.multiple) {
          _wrapper.attr('multiple', true);
        }
        _wrapper.addClass('km-multiselect-display-none');

        multiselect.drawLayout(_wrapper, $depth);
        multiselect.deligateFunctions(_wrapper, $depth);
      },
      drawLayout: function (_wrapper, $depth) {
        _wrapper.parent().find('.km-multiselect').remove();

        var html = '<div class="km-multiselect km-multiselect-depth-' + $depth + '" km-multiselect-depth="' + $depth + '">' +
            '<div class="km-multiselect-selectBox-above-header-info"></div>' +
            '<div class="km-multiselect-selectBox">' +
            '<select>' +
            '<option>' + _settings.subject + '</option>' +
            '</select>' +
            '<div class="km-multiselect-overSelect"></div>' +
            '</div>' +
            '<div class="km-checkboxes km-multiselect-display-none">';


        if (_settings.checkAll && _settings.multiple == true) {
          html += '<div><span class="km-multiselect-check-all-tick">Check All</span> <span class="km-multiselect-uncheck-all-tick">Uncheck All</span></div>';
        }
        if (_settings.search) {
          html += '<div><input type="text" placeholder="Search.." class="km-multiselect-option-search"></div>';
        }

        var loopData = [];
        if ($depth == 1) {
          loopData = _globalData;
        }
        else if ($depth == 2) {
          _globalData.forEach(function (row) {
            if (row.isDefault) {
              row.child.forEach(function (r) {
                loopData.push(r);
              });
            }
          });
        }
        else if ($depth == 3) {
          _globalData.forEach(function (row) {
            if (row.isDefault) {
              row.child.forEach(function (r) {
                if (r.isDefault) {
                  r.child.forEach(function (rm) {
                    loopData.push(rm);
                  });
                }
              });
            }
          });
        }

        loopData.forEach(function (row) {
          var chk = '';
          if (row.isDefault) {
            chk = 'checked="checked"';
          }
          if (_settings.multiple) {
            html += '<label class="km-multiselect-checkbox-label">' +
                '<input type="checkbox" class="km-multiselect-checkbox-input" ' + chk + ' data-km-select-key="' + row.key + '" data-km-select-value="' + row.value + '"/>' +
                row.value +
                '</label>'
          }
          else {
            html += '<label class="km-multiselect-checkbox-label">' +
                '<input type="radio" class="km-multiselect-checkbox-input" ' + chk + ' data-km-select-key="' + row.key + '" data-km-select-value="' + row.value + '"/>' +
                row.value +
                '</label>'
          }
        });

        html += '</div></div>';
        _wrapper.after(html);
        multiselect.afterDrawLayout(_wrapper);

      },
      afterDrawLayout: function (_wrapper) {
        setTimeout(function () {
          var width = _wrapper.parent().find('.km-multiselect-overSelect').width();
          _wrapper.parent().find('.km-checkboxes').css({
            'width': width - 10,
            'max-height': _settings.height,
            'overflow-y': 'auto'
          });
          multiselect.titleRebuild(_wrapper);
        }, 200);
      },
      titleRebuild: function (_wrapper) {
        var Values = new Array();
        var Labels = new Array();
        var count = 0;
        _wrapper.parent().find('.km-multiselect-checkbox-input').each(function () {
          if ($(this).is(':checked')) {
            Values.push($(this).attr('data-km-select-key'));
            Labels.push($(this).attr('data-km-select-value'));
            count++;
          }
        });

        var title = Labels.length > 0 ? Labels.toString() : _settings.subject;
        _wrapper.parent().find('.km-multiselect-selectBox select option:first').text(title);

        _wrapper.find('option').each(function () {
          if(Values.indexOf($(this).attr('value')) != -1){
            $(this).attr('selected', 'selected');
          } else {

            $(this).removeAttr('selected');
          }
        });

        //_wrapper.val(Values).trigger('change');

        if (_settings.selectedTexts) {
          _wrapper.parent().find('.km-multiselect-selectBox-above-header-info').html('Selected Items (' + count + ')')
        }
      },
      deligateFunctions: function (_wrapper) {
        _wrapper.parent().on('click', '.km-multiselect-selectBox', function () {
          _wrapper.parent().find('.km-checkboxes').toggleClass('km-multiselect-display-none');
        });

        _wrapper.parent().on('click', '.km-multiselect-checkbox-input', function () {
          var depth = $(this).parents('.km-multiselect').attr('km-multiselect-depth');


          var chk = false;
          if ($(this).is(":checked")) {
            chk = true;
          }

          if (!_settings.multiple) {
            _wrapper.parent().find('.km-multiselect-checkbox-input').each(function () {
              $(this).prop('checked', false);
            });
            $(this).prop('checked', true);
          }

          var key = $(this).attr('data-km-select-key');

          var data = _globalData;

          if (depth == 1) {
            data.forEach(function (row, k) {
              if (row.key == key) {
                _globalData[k]['isDefault'] = chk;
              }
              else if (!_settings.multiple) {
                _globalData[k]['isDefault'] = false;
              }
            });
            multiselect.drawLayout($(_items[1]), 2);
            multiselect.drawLayout($(_items[2]), 3);
          }
          else if (depth == 2) {
            data.forEach(function (row, k) {
              row.child.forEach(function (rm, km) {
                if (rm.key == key) {
                  _globalData[k]['child'][km]['isDefault'] = chk;
                }
                else if (!_settings.multiple) {
                  _globalData[k]['child'][km]['isDefault'] = false;
                }
              });
            });
            multiselect.drawLayout($(_items[2]), 3);
          }
          else if (depth == 3) {
            data.forEach(function (row, k) {
              row.child.forEach(function (rm, km) {
                rm.child.forEach(function (rmm, kmm) {
                  if (rmm.key == key) {
                    _globalData[k]['child'][km]['child'][kmm]['isDefault'] = chk;
                  }
                  else if (!_settings.multiple) {
                    _globalData[k]['child'][km]['child'][kmm]['isDefault'] = false;
                  }
                });
              });
            });
          }

          multiselect.titleRebuild(_wrapper);

        });

        _wrapper.parent().on('keyup', '.km-multiselect-option-search', function () {
          var val = $(this).val().toLowerCase();

          _wrapper.parent().find('.km-multiselect-checkbox-input').each(function () {
            var label = $(this).attr('data-km-select-value').toLowerCase();
            var search = label.search(val);
            if (search < 0 && val != '') {
              $(this).parent('label').hide();
            }
            else {
              $(this).parent('label').show();
            }
          });

        });

        _wrapper.parent().on('click', '.km-multiselect-check-all-tick', function () {
          _wrapper.find('option').each(function () {
            $(this).attr('selected', 'selected');
            optionValuePair[$(this).val()] = $(this).text();
          });

          $.each(optionValuePair, function (key, value) {
            optionValuePairChekbox[key] = true;
          });

          _wrapper.parent().find('.km-multiselect-checkbox-input').each(function () {
            $(this).prop('checked', true);
          });

          multiselect.titleRebuild(_wrapper);
        });

        _wrapper.parent().on('click', '.km-multiselect-uncheck-all-tick', function () {
          _wrapper.find('option').each(function () {
            $(this).removeAttr('selected');
            optionValuePair[$(this).val()] = $(this).text();
          });

          $.each(optionValuePair, function (key, value) {
            optionValuePairChekbox[key] = false;
          })

          _wrapper.parent().find('.km-multiselect-checkbox-input').each(function () {
            $(this).prop('checked', false);
          });

          multiselect.titleRebuild(_wrapper);

          _wrapper.trigger('change');
        });

        $('body').click(function (e) {

          if ($(e.target).parents('.km-multiselect').length == 0) {
            _wrapper.parent().find('.km-checkboxes').addClass('km-multiselect-display-none');
          } else {
            _wrapper.parent().find('.km-checkboxes').addClass('km-multiselect-display-none');

            if ($(e.target).parents('.km-multiselect').length != 0) {
              // _wrapper.parent().find('.km-checkboxes').removeClass('km-multiselect-display-none');
              $(e.target).parents('.km-multiselect').find('.km-checkboxes').removeClass('km-multiselect-display-none');
            }
          }
        });
      }
    }
    multiselect.processData();
  }

})(jQuery);