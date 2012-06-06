/****************************************************************************
**
** Copyright (C) 2012 Nokia Corporation and/or its subsidiary(-ies).
** Contact: http://www.qt-project.org/
**
** This file is part of the test suite of the Qt Toolkit.
**
** $QT_BEGIN_LICENSE:LGPL$
** GNU Lesser General Public License Usage
** This file may be used under the terms of the GNU Lesser General Public
** License version 2.1 as published by the Free Software Foundation and
** appearing in the file LICENSE.LGPL included in the packaging of this
** file. Please review the following information to ensure the GNU Lesser
** General Public License version 2.1 requirements will be met:
** http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html.
**
** In addition, as a special exception, Nokia gives you certain additional
** rights. These rights are described in the Nokia Qt LGPL Exception
** version 1.1, included in the file LGPL_EXCEPTION.txt in this package.
**
** GNU General Public License Usage
** Alternatively, this file may be used under the terms of the GNU General
** Public License version 3.0 as published by the Free Software Foundation
** and appearing in the file LICENSE.GPL included in the packaging of this
** file. Please review the following information to ensure the GNU General
** Public License version 3.0 requirements will be met:
** http://www.gnu.org/copyleft/gpl.html.
**
** Other Usage
** Alternatively, this file may be used in accordance with the terms and
** conditions contained in a signed written agreement between you and Nokia.
**
**
**
**
**
**
** $QT_END_LICENSE$
**
****************************************************************************/

import QtQuick 2.0
import QtTest 1.0

Rectangle {
    id:rect
    width: 40
    height: 40
    color:"red"
    TestCase {
        name: "Pixels"
        when: windowShown

        function test_pixel() {
           wait(200);
           var img = grabImage(rect);
           compare(img.pixel(20, 20), Qt.rgba(255, 0, 0, 255));
           compare(img.red(1,1), 255);
           compare(img.green(1,1), 0);
           compare(img.blue(1,1), 0);
           compare(img.alpha(1,1), 255);

           rect.color = "blue";
           wait(200);
           img = grabImage(rect);
           compare(img.pixel(20, 20), Qt.rgba(0, 0, 255, 255));
           compare(img.red(1,1), 0);
           compare(img.green(1,1), 0);
           compare(img.blue(1,1), 255);
           compare(img.alpha(1,1), 255);
        }

    }
}