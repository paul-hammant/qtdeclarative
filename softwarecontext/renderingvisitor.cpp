/****************************************************************************
**
** Copyright (C) 2014 Digia Plc
** All rights reserved.
** For any questions to Digia, please use contact form at http://qt.digia.com
**
** This file is part of the Qt SceneGraph Raster Add-on.
**
** $QT_BEGIN_LICENSE$
** Licensees holding valid Qt Commercial licenses may use this file in
** accordance with the Qt Commercial License Agreement provided with the
** Software or, alternatively, in accordance with the terms contained in
** a written agreement between you and Digia.
**
** If you have questions regarding the use of this file, please use
** contact form at http://qt.digia.com
** $QT_END_LICENSE$
**
****************************************************************************/
#include "renderingvisitor.h"

#include "imagenode.h"
#include "rectanglenode.h"
#include "glyphnode.h"
#include "ninepatchnode.h"

RenderingVisitor::RenderingVisitor(QPainter *painter)
    : painter(painter)
{

}

void RenderingVisitor::visit(QSGTransformNode *node)
{
    painter->save();
    painter->setTransform(node->matrix().toTransform(), /*combine*/true);
}

void RenderingVisitor::endVisit(QSGTransformNode *)
{
    painter->restore();
}

void RenderingVisitor::visit(QSGClipNode *node)
{
    painter->save();
    painter->setClipRect(node->clipRect(), Qt::IntersectClip);
}

void RenderingVisitor::endVisit(QSGClipNode *)
{
    painter->restore();
}

void RenderingVisitor::visit(QSGGeometryNode *node)
{
//    Q_UNREACHABLE();
}

void RenderingVisitor::endVisit(QSGGeometryNode *node)
{
//    Q_UNREACHABLE();
}

void RenderingVisitor::visit(QSGOpacityNode *node)
{
    painter->save();
    painter->setOpacity(node->opacity());
}

void RenderingVisitor::endVisit(QSGOpacityNode *node)
{
    painter->restore();
}

void RenderingVisitor::visit(QSGImageNode *node)
{
    static_cast<ImageNode*>(node)->paint(painter);
}

void RenderingVisitor::endVisit(QSGImageNode *)
{
}

void RenderingVisitor::visit(QSGRectangleNode *node)
{
    static_cast<RectangleNode*>(node)->paint(painter);
}

void RenderingVisitor::endVisit(QSGRectangleNode *)
{
}

void RenderingVisitor::visit(QSGGlyphNode *node)
{
    static_cast<GlyphNode*>(node)->paint(painter);
}

void RenderingVisitor::endVisit(QSGGlyphNode *)
{
}

void RenderingVisitor::visit(QSGNinePatchNode *node)
{
    static_cast<NinePatchNode*>(node)->paint(painter);
}

void RenderingVisitor::endVisit(QSGNinePatchNode *)
{

}